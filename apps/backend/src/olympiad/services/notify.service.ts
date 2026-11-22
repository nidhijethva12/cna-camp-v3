import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { config } from '../../config.js';
import {
  partnerApprovedEmail,
  partnerSignupEmail,
  passwordResetEmail,
  registrationEmail,
  reminderEmail,
} from '../emails.js';
import { MODELS, type PersonDoc } from '../schemas.js';
import { receiptToken } from '../registration-ids.js';
import { createToken, DAY } from '../tokens.js';
import { MessagingService, type SendResult } from './messaging.service.js';
import { formatIstDate, SettingsService } from './settings.service.js';

const firstName = (name: string) => name.trim().split(/\s+/)[0];
const url = (path: string) => `${config.siteUrl}${path}`;

export const unsubscribeUrl = (personId: string) =>
  url(
    `/olympiad/unsubscribe/${createToken('unsubscribe', personId, 365 * DAY)}`,
  );
/** The link a partner shares: it records the open and carries their code into the registration form. */
export const partnerLinkUrl = (code: string) => url(`/olympiad/r/${code}`);
export const dashboardUrl = (kind: 'school' | 'ambassador') =>
  url(kind === 'school' ? '/school-dashboard' : '/ambassador-dashboard');

export interface ApprovedPartner {
  kind: 'school' | 'ambassador';
  code: string;
  /** The person to greet: the Ambassador, or the school's coordinator. */
  name: string;
  whatsapp: string;
  email?: string;
  schoolName?: string;
  /** One-time link to choose the dashboard password; absent when CNA already set one. */
  setPasswordUrl?: string;
  /** "gu" sends the Gujarati copy of the WhatsApp template. */
  language?: string;
}

/** The registration receipt, ready to download as a PDF. The link works for two years. */
export const receiptUrl = (personId: string, lang?: string) =>
  url(
    `/olympiad/receipt/${createToken('receipt', personId, 730 * DAY)}${lang === 'gu' ? '?lang=gu' : ''}`,
  );

/** Where a partner chooses their dashboard password. */
export const setPasswordUrl = (token: string) =>
  url(`/olympiad/password/${token}`);

/** Every message the Olympiad sends; people who stopped a channel are skipped. */
@Injectable()
export class NotifyService {
  private readonly log = new Logger('Notify');

  constructor(
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
    private readonly messaging: MessagingService,
    private readonly settings: SettingsService,
  ) {}

  /** Saves the outcome of the latest message on the person, for the master list. */
  private async record(
    id: Types.ObjectId,
    template: string,
    channel: 'whatsapp' | 'email',
    result: SendResult,
  ) {
    await this.people.updateOne(
      { _id: id },
      {
        $set: {
          lastMessage: {
            template,
            channel,
            status: result.status,
            at: new Date(),
            providerId: result.providerId,
          },
        },
      },
    );
    if (result.status === 'failed')
      this.log.error(
        `${channel} ${template} failed for ${String(id)}: ${result.error}`,
      );
  }

  /** "You are on the list": WhatsApp confirmation and the "stay tuned" email. */
  async reminder(person: PersonDoc) {
    const opensOn = formatIstDate((await this.settings.olympiad()).opensAt);
    if (!person.whatsappStopped) {
      const template = 'olympiad_reminder_confirm';
      await this.record(
        person._id,
        template,
        'whatsapp',
        await this.messaging.whatsapp({
          to: person.whatsapp,
          template,
          params: [firstName(person.name), opensOn],
        }),
      );
    }
    if (person.email && !person.emailStopped) {
      const contact = await this.settings.contact();
      const mail = reminderEmail({
        name: person.name,
        opensOn,
        pageUrl: url('/olympiad'),
        phone: contact.phone,
        unsubscribeUrl: unsubscribeUrl(String(person._id)),
      });
      await this.record(
        person._id,
        'stay-tuned',
        'email',
        await this.messaging.email({
          to: person.email,
          replyTo: contact.email || undefined,
          ...mail,
        }),
      );
    }
  }

  /** Registration number and receipt, on WhatsApp and by email, once the fee is confirmed. */
  async registrationConfirmed(person: PersonDoc) {
    const fee = person.fee ?? 0;
    if (!person.whatsappStopped) {
      const template = 'olympiad_registration_confirmed';
      const gujarati = person.formLanguage === 'gu';
      const result = await this.messaging.whatsapp({
        to: person.whatsapp,
        template,
        language: gujarati ? 'gu' : 'en',
        params: [
          firstName(person.name),
          person.regId ?? '',
          person.group ?? '',
          String(fee),
        ],
        // The "Download receipt" button: the template holds the address, this is the part after it.
        buttonParam: `${receiptToken(person)}${gujarati ? '?lang=gu' : ''}`,
      });
      await this.record(person._id, template, 'whatsapp', result);
    }
    if (person.email && !person.emailStopped) {
      const mail = registrationEmail({
        name: person.name,
        regId: person.regId ?? '',
        group: person.group ?? '',
        fee,
        paymentId: person.razorpayPaymentId ?? '',
        receiptUrl: receiptUrl(String(person._id), person.formLanguage),
        pageUrl: url('/olympiad'),
        unsubscribeUrl: unsubscribeUrl(String(person._id)),
      });
      await this.record(
        person._id,
        'receipt',
        'email',
        await this.messaging.email({ to: person.email, ...mail }),
      );
    }
  }

  /** Welcome message with the new code, sent when CNA approves a School or an Ambassador. */
  async partnerApproved(p: ApprovedPartner) {
    // WhatsApp points at the dashboard; the link to choose a password goes by email only.
    const whatsapp = await this.messaging.whatsapp(
      p.kind === 'school'
        ? {
            to: p.whatsapp,
            template: 'olympiad_school_approved',
            language: p.language,
            params: [firstName(p.name), p.schoolName ?? ''],
          }
        : {
            to: p.whatsapp,
            template: 'olympiad_ambassador_approved',
            language: p.language,
            // The Ambassador's own link, in the text so the message can be forwarded as it is.
            params: [firstName(p.name), partnerLinkUrl(p.code)],
          },
    );
    if (whatsapp.status === 'failed')
      this.log.error(
        `approval WhatsApp failed for ${p.code}: ${whatsapp.error}`,
      );
    if (p.email) {
      const mail = partnerApprovedEmail({
        kind: p.kind,
        name: p.name,
        code: p.code,
        dashboardUrl: dashboardUrl(p.kind),
        setPasswordUrl: p.setPasswordUrl,
        shareUrl: p.kind === 'ambassador' ? partnerLinkUrl(p.code) : undefined,
      });
      const result = await this.messaging.email({ to: p.email, ...mail });
      if (result.status === 'failed')
        this.log.error(`approval email failed for ${p.code}: ${result.error}`);
    }
  }

  /** "Forgot your password?": a fresh one-time link to the partner's login email. */
  async passwordReset(to: string, name: string, link: string) {
    const result = await this.messaging.email({
      to,
      ...passwordResetEmail({ name, setPasswordUrl: link }),
    });
    if (result.status === 'failed')
      this.log.error(`password reset email failed: ${result.error}`);
  }

  /** Tells the CNA team that a school or Ambassador signed up and waits for approval. */
  async partnerSignup(p: {
    kind: 'school' | 'ambassador';
    id: string;
    name: string;
    detail: string;
  }) {
    const team = config.smtp?.from;
    if (!team) return;
    const collection =
      p.kind === 'school' ? 'olympiad-schools' : 'olympiad-ambassadors';
    const result = await this.messaging.email({
      to: team,
      ...partnerSignupEmail({
        kind: p.kind,
        name: p.name,
        detail: p.detail,
        adminUrl: url(`/admin/collections/${collection}/${p.id}`),
      }),
    });
    if (result.status === 'failed')
      this.log.error(`sign-up email to the team failed: ${result.error}`);
  }

  /** Asks the parent of an under-18 student to confirm consent with one tap. */
  async requestParentConsent(person: PersonDoc, registeredBy: string) {
    if (!person.parentPhone || person.whatsappStopped) return;
    const template = 'olympiad_parent_consent';
    const result = await this.messaging.whatsapp({
      to: person.parentPhone,
      template,
      params: [person.parentName || 'Parent', registeredBy, person.name],
      buttonParam: createToken('consent', String(person._id), 60 * DAY),
    });
    await this.record(person._id, template, 'whatsapp', result);
    await this.people.updateOne(
      { _id: person._id },
      { $set: { 'parentConsent.requestedAt': new Date() } },
    );
  }
}
