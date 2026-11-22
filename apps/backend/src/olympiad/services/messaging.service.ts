import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../../config.js';

/** Graph API version for the WhatsApp Cloud API; Meta supports each version for about two years. */
const GRAPH_VERSION = 'v23.0';

/** Every template exists in English; other languages are optional copies with the same name. */
const DEFAULT_LANGUAGE = 'en';

export type SendStatus = 'sent' | 'failed' | 'skipped';
export interface SendResult {
  status: SendStatus;
  providerId?: string;
  error?: string;
}

export interface TemplateMessage {
  /** E.164, e.g. +919825012345. */
  to: string;
  /** Approved template name (see OLYMPIAD-SETUP.md). */
  template: string;
  /** Body variables {{1}}, {{2}} … in order. */
  params: string[];
  /** Variable of a dynamic URL button, e.g. a token. */
  buttonParam?: string;
  /** The template's language in Meta: "en" or "gu". A Gujarati copy that is not approved yet falls back to English. */
  language?: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/**
 * WhatsApp (Meta Cloud API) and email (SMTP). Until a channel is configured its messages are logged
 * and reported as "skipped", so forms and flows keep working while accounts are being approved.
 */
@Injectable()
export class MessagingService {
  private readonly log = new Logger('Messaging');
  private transport: Transporter | null = null;

  get whatsappReady() {
    return Boolean(config.whatsapp.token && config.whatsapp.phoneNumberId);
  }

  async whatsapp(message: TemplateMessage): Promise<SendResult> {
    if (!this.whatsappReady) {
      this.log.log(
        `WhatsApp not configured, skipped ${message.template} to ${message.to.slice(0, 6)}…`,
      );
      return { status: 'skipped' };
    }
    const language = message.language ?? DEFAULT_LANGUAGE;
    const first = await this.sendTemplate(message, language);
    if (first.status !== 'failed' || language === DEFAULT_LANGUAGE)
      return first;
    // The same template exists in English even when its copy in another language is missing or paused.
    this.log.warn(
      `${message.template} (${language}) failed: ${first.error}; sending the English one`,
    );
    return this.sendTemplate(message, DEFAULT_LANGUAGE);
  }

  private async sendTemplate(
    { to, template, params, buttonParam }: TemplateMessage,
    language: string,
  ): Promise<SendResult> {
    const components: Record<string, unknown>[] = [];
    if (params.length)
      components.push({
        type: 'body',
        parameters: params.map((text) => ({ type: 'text', text })),
      });
    if (buttonParam) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: buttonParam }],
      });
    }
    try {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${config.whatsapp.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.whatsapp.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/^\+/, ''),
            type: 'template',
            template: {
              name: template,
              language: { code: language },
              components,
            },
          }),
          signal: AbortSignal.timeout(10_000),
        },
      );
      const data = (await res.json()) as {
        messages?: { id: string }[];
        error?: { message?: string };
      };
      if (!res.ok || !data.messages?.[0])
        return {
          status: 'failed',
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      return { status: 'sent', providerId: data.messages[0].id };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async email(message: EmailMessage): Promise<SendResult> {
    const smtp = config.smtp;
    if (!smtp) {
      this.log.log(
        `SMTP not configured, skipped "${message.subject}" to ${message.to}`,
      );
      return { status: 'skipped' };
    }
    this.transport ??= nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    try {
      const info = await this.transport.sendMail({
        from: { name: smtp.fromName, address: smtp.from },
        ...message,
      });
      return { status: 'sent', providerId: info.messageId };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
