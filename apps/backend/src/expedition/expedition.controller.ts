import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientIp, InternalKeyGuard } from '../common/internal.guard.js';
import {
  ExpeditionService,
  type ExpeditionInput,
} from './expedition.service.js';

/** The Sindhu Darshan Yatra registration, called by the website's server only (InternalKeyGuard). */
@Controller('expedition')
@UseGuards(InternalKeyGuard)
export class ExpeditionController {
  constructor(private readonly expedition: ExpeditionService) {}

  @Post('registrations')
  @HttpCode(200)
  register(@Body() body: ExpeditionInput, @ClientIp() ip?: string) {
    return this.expedition.register(body, ip);
  }

  @Post('payments/confirm')
  @HttpCode(200)
  confirm(
    @Body()
    body: {
      orderId?: unknown;
      paymentId?: unknown;
      signature?: unknown;
    },
  ) {
    return this.expedition.confirmFromCheckout(body);
  }

  @Post('receipts')
  @HttpCode(200)
  async receipt(@Body() body: { token?: unknown }) {
    const receipt = await this.expedition.receipt(body.token);
    if (!receipt) throw new NotFoundException();
    return receipt;
  }

  /** "Send the Zoom link again" from the public page. */
  @Post('resend')
  @HttpCode(200)
  resend(@Body() body: { whatsapp?: unknown }) {
    return this.expedition.resendFromPage(body);
  }

  /** "Send again" for one person, from the admin. */
  @Post('admin/resend')
  @HttpCode(200)
  adminResend(@Body() body: { id?: unknown }) {
    return this.expedition.resendFromAdmin(body);
  }

  /** "Send to all" from the admin: the Zoom link to those without it, or the meeting-day reminder. */
  @Post('admin/send-all')
  @HttpCode(200)
  sendAll(@Body() body: { kind?: unknown }) {
    return this.expedition.sendToAll(body);
  }
}
