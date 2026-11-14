import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { config } from '../config.js';
import { safeEqual } from './security.js';

/**
 * Only the website's own server may call the Olympiad API: every request carries the shared
 * BACKEND_API_KEY. Browsers never call this API directly, so the key never reaches them.
 */
@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const key =
      context.switchToHttp().getRequest<Request>().header('x-internal-key') ??
      '';
    if (!safeEqual(key, config.apiKey)) throw new UnauthorizedException();
    return true;
  }
}

/**
 * The visitor's IP as forwarded by the website. Trusted only behind InternalKeyGuard, because only
 * the website can send that header with a valid key.
 */
export const ClientIp = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ip = context
      .switchToHttp()
      .getRequest<Request>()
      .header('x-client-ip')
      ?.trim();
    return ip && ip.length <= 64 ? ip : undefined;
  },
);
