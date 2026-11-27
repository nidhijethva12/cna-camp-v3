import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { config } from '../config.js';
import { safeEqual } from '../common/security.js';
import { ExpeditionService } from '../expedition/expedition.service.js';
import { webhookSignatureValid } from './razorpay.js';
import { LinksService } from './services/links.service.js';
import { PaymentsService } from './services/payments.service.js';

interface RazorpayEvent {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        error_description?: string;
      };
    };
    order?: { entity?: { id?: string; amount_paid?: number } };
  };
}

/**
 * Called by Razorpay and Meta, not by the website, so they are open routes. Each one checks the
 * provider's signature on the raw body before doing anything.
 */
@Controller('olympiad/webhooks')
export class WebhooksController {
  private readonly log = new Logger('Webhooks');

  constructor(
    private readonly payments: PaymentsService,
    private readonly links: LinksService,
    private readonly expedition: ExpeditionService,
  ) {}

  /** The server-side proof of payment; it also covers people who close the tab before returning. */
  @Post('razorpay')
  @HttpCode(200)
  async razorpay(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    if (!webhookSignatureValid(req.rawBody, signature)) {
      this.log.warn('Razorpay webhook with an invalid signature');
      throw new BadRequestException();
    }
    const event = req.body as RazorpayEvent;
    const payment = event.payload?.payment?.entity;
    if (
      (event.event === 'payment.captured' || event.event === 'order.paid') &&
      payment?.order_id &&
      payment.id
    ) {
      // One Razorpay account serves both: an order belongs to the Olympiad or to the expedition.
      if (
        !(await this.expedition.markPaid(
          payment.order_id,
          payment.id,
          payment.amount,
        ))
      )
        await this.payments.markPaid(
          payment.order_id,
          payment.id,
          payment.amount,
        );
    } else if (event.event === 'payment.failed' && payment?.order_id) {
      const reason = payment.error_description ?? 'Payment failed';
      await this.expedition.markFailed(payment.order_id, reason);
      await this.payments.markFailed(payment.order_id, reason);
    }
    return { ok: true };
  }

  /** Meta's one-time check when the webhook URL is saved in the app settings. */
  @Get('whatsapp')
  verifyWhatsApp(
    @Query('hub.mode') mode?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') challenge?: string,
  ) {
    const expected = config.whatsapp.verifyToken;
    if (
      mode !== 'subscribe' ||
      !expected ||
      !token ||
      !safeEqual(token, expected)
    )
      throw new ForbiddenException();
    return challenge ?? '';
  }

  @Post('whatsapp')
  @HttpCode(200)
  async whatsapp(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: unknown,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    if (!this.links.whatsappSignatureValid(req.rawBody, signature)) {
      this.log.warn('WhatsApp webhook with an invalid signature');
      throw new BadRequestException();
    }
    const event = body as Parameters<LinksService['whatsappEvent']>[0];
    await this.links.whatsappEvent(event);
    for (const change of event.entry?.flatMap((e) => e.changes ?? []) ?? [])
      for (const s of change.value?.statuses ?? [])
        if (
          s.status === 'sent' ||
          s.status === 'delivered' ||
          s.status === 'read' ||
          s.status === 'failed'
        )
          await this.expedition.whatsappStatus(s.id, s.status);
    return { ok: true };
  }
}
