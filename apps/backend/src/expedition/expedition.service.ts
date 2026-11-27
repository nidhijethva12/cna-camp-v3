import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import { config } from '../config.js';
import {
  background,
  FormError,
  text,
  throwIfErrors,
  tooMany,
  type FieldErrors,
} from '../common/forms.js';
import { ipHash, passesTurnstile, since } from '../common/security.js';
import {
  capturePayment,
  checkoutSignatureValid,
  createOrder,
  fetchPayment,
  razorpayReady,
} from '../olympiad/razorpay.js';
import { isDistrict } from '../olympiad/rules.js';
import {
  MessagingService,
  type SendResult,
} from '../olympiad/services/messaging.service.js';
import { createToken, DAY, readToken } from '../olympiad/tokens.js';
import {
  EXPEDITION_MODELS,
  GENDERS,
  type ExpeditionDoc,
  type ExpeditionMessage,
  type Gender,
} from './expedition.schema.js';

/** Approved in Meta under these names (English). */
const TEMPLATE_CONFIRMED = 'expedition_registration_confirmed';
const TEMPLATE_REMINDER = 'expedition_zoom_reminder';

const SETTINGS_SLUG = 'expedition-settings';
const CACHE_MS = 30_000;

/** Used until CNA saves the settings in the admin. */
const FALLBACK = {
  opensAt: '2026-11-29T12:36:00.000Z',
  closesAt: '2026-12-26T09:48:00.000Z',
  fee: 108,
  minAge: 18,
};

const MAX_AGE = 90;
/** Forms one visitor may send in an hour. */
const FORMS_PER_HOUR = 10;
/** "Send again" presses per registration from the public page. */
const PUBLIC_RESENDS = 5;
const RESEND_GAP_MS = 2 * 60_000;
/** One "send to all" press works for this long, then reports how many are left. */
const BULK_BUDGET_MS = 12_000;
const BULK_AT_ONCE = 8;
/** A reminder is not repeated to the same person within this time. */
const REMINDER_GAP_MS = 2 * 60 * 60_000;
const RECEIPT_DAYS = 400;

const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .']{2,59}$/u;
const MOBILE = /^[6-9]\d{9}$/;

type Raw = Record<string, unknown>;

export interface ExpeditionSettings {
  mode: 'auto' | 'open' | 'closed';
  opensAt: Date;
  closesAt: Date;
  fee: number;
  minAge: number;
  zoomLink: string;
}

export type ExpeditionPhase = 'before' | 'open' | 'closed';

export interface ExpeditionInput {
  name?: unknown;
  whatsapp?: unknown;
  district?: unknown;
  age?: unknown;
  gender?: unknown;
  agree?: unknown;
  /** Hidden field only bots fill in. */
  website?: unknown;
  turnstileToken?: unknown;
}

type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

/** Ticks can arrive out of order: a status only replaces the ones listed for it. */
const REPLACES: Record<DeliveryStatus, string[]> = {
  sent: [],
  delivered: ['sent'],
  read: ['sent', 'delivered'],
  failed: ['sent'],
};

const DELIVERED = ['sent', 'delivered', 'read'];

const digits = (value: unknown) =>
  text(value, 20)
    .replace(/\D/g, '')
    .replace(/^(?:91|0)(?=\d{10}$)/, '');

const masked = (whatsapp: string) =>
  `+91 ${'•'.repeat(6)}${whatsapp.slice(-4)}`;

/**
 * Registration for the Sarasvati - Sindhu Darshan Yatra information meeting: a short form, a small
 * Razorpay fee, then the Zoom link on WhatsApp. The link itself lives only in the admin's settings.
 */
@Injectable()
export class ExpeditionService {
  private readonly log = new Logger('Expedition');
  private cache: { at: number; doc: Raw | null } | null = null;

  constructor(
    @InjectModel(EXPEDITION_MODELS.registration)
    private readonly registrations: Model<ExpeditionDoc>,
    @InjectModel(EXPEDITION_MODELS.counter)
    private readonly counters: Model<{ key: string; value: number }>,
    @InjectModel(EXPEDITION_MODELS.global)
    private readonly globals: Model<Raw>,
    private readonly messaging: MessagingService,
  ) {}

  async settings(fresh = false): Promise<ExpeditionSettings> {
    if (fresh || !this.cache || Date.now() - this.cache.at > CACHE_MS) {
      const doc = await this.globals
        .findOne({ globalType: SETTINGS_SLUG })
        .lean<Raw>();
      this.cache = { at: Date.now(), doc };
    }
    const doc = this.cache.doc ?? {};
    const date = (value: unknown, fallback: string) =>
      new Date((value as string | Date | undefined) ?? fallback);
    const whole = (value: unknown, fallback: number) =>
      typeof value === 'number' && Number.isInteger(value) && value > 0
        ? value
        : fallback;
    const link = typeof doc.zoomLink === 'string' ? doc.zoomLink.trim() : '';
    return {
      mode: (doc.registrationMode as ExpeditionSettings['mode']) ?? 'auto',
      opensAt: date(doc.opensAt, FALLBACK.opensAt),
      closesAt: date(doc.closesAt, FALLBACK.closesAt),
      fee: whole(doc.fee, FALLBACK.fee),
      minAge: whole(doc.minAge, FALLBACK.minAge),
      zoomLink: /^https:\/\/\S+$/.test(link) ? link : '',
    };
  }

  /** Decided on this server's clock, never the visitor's. */
  phase(s: ExpeditionSettings, now = new Date()): ExpeditionPhase {
    if (s.mode === 'open') return 'open';
    if (s.mode === 'closed') return 'closed';
    if (now.getTime() < s.opensAt.getTime()) return 'before';
    return now.getTime() > s.closesAt.getTime() ? 'closed' : 'open';
  }

  /**
   * Saves the form and opens a Razorpay order for the fee. A number that has already paid is refused
   * (409) so the page can offer "send the link again"; an unpaid one is simply updated.
   */
  async register(input: ExpeditionInput, ip: string | undefined) {
    if (text(input.website))
      throw new FormError('Please check the form and try again.');
    if (!(await passesTurnstile(text(input.turnstileToken, 2048), ip)))
      throw new FormError('Please complete the security check and try again.');

    const s = await this.settings();
    const phase = this.phase(s);
    if (phase === 'before')
      throw new FormError('Registration has not opened yet.');
    if (phase === 'closed') throw new FormError('Registration is closed.');

    const name = text(input.name, 80);
    const mobile = digits(input.whatsapp);
    const district = text(input.district, 60);
    const age = Number(input.age);
    const gender = text(input.gender, 20) as Gender;
    const errors: FieldErrors = {};
    if (!NAME.test(name))
      errors.name = 'Enter your full name (3 to 60 letters).';
    if (!MOBILE.test(mobile))
      errors.whatsapp = 'Enter a 10 digit Indian mobile number.';
    if (!isDistrict(district)) errors.district = 'Choose your district.';
    if (!Number.isInteger(age) || age < 1 || age > MAX_AGE)
      errors.age = 'Enter your age.';
    else if (age < s.minAge)
      errors.age = `You must be ${s.minAge} or older to register.`;
    if (!GENDERS.includes(gender)) errors.gender = 'Choose one.';
    if (input.agree !== true) errors.agree = 'Please tick the box to continue.';
    throwIfErrors(errors);

    const whatsapp = `+91${mobile}`;
    const already = () =>
      new FormError(
        'This number is already registered.',
        { whatsapp: 'This number is already registered.' },
        HttpStatus.CONFLICT,
      );
    if (await this.registrations.exists({ whatsapp, status: 'paid' }))
      throw already();

    const visitor = ipHash(ip);
    if (
      visitor &&
      (await this.registrations.countDocuments({
        ipHash: visitor,
        updatedAt: { $gte: since(60 * 60_000) },
      })) >= FORMS_PER_HOUR
    )
      throw tooMany(
        'Too many registrations from this device. Please try again in an hour.',
      );

    let doc: ExpeditionDoc | null;
    try {
      doc = await this.registrations
        .findOneAndUpdate(
          { whatsapp, status: { $ne: 'paid' } },
          {
            $set: {
              name,
              district,
              age,
              gender,
              fee: s.fee,
              status: 'pending',
              agreedAt: new Date(),
              ...(visitor ? { ipHash: visitor } : {}),
            },
            $unset: { failureReason: 1 },
            $setOnInsert: { whatsapp, orders: [] },
          },
          { upsert: true, new: true },
        )
        .lean<ExpeditionDoc>();
    } catch (err) {
      // The unique index on the number: it was paid for, or saved, in the same instant.
      if ((err as { code?: number }).code === 11000) throw already();
      throw err;
    }
    if (!doc) throw new FormError('Please try again.');

    return {
      id: String(doc._id),
      name,
      fee: s.fee,
      order: await this.openOrder(doc, s.fee),
      prefill: { name, email: '', contact: whatsapp },
    };
  }

  private async openOrder(doc: ExpeditionDoc, fee: number) {
    if (!razorpayReady()) return null;
    const order = await createOrder(fee * 100, `ssd-${String(doc._id)}`, {
      purpose: 'Sarasvati - Sindhu Darshan Yatra registration',
      registration: String(doc._id),
    });
    await this.registrations.updateOne(
      { _id: doc._id },
      { $addToSet: { orders: order.id } },
    );
    return {
      orderId: order.id,
      amount: order.amount,
      keyId: config.razorpay.keyId!,
    };
  }

  /**
   * Marks the registration behind a Razorpay order paid exactly once (the Checkout callback and the
   * webhook can both arrive), gives it its Registration ID and sends the Zoom link. Returns false
   * when the order is not an expedition order at all.
   */
  async markPaid(orderId: string, paymentId: string, amountPaise?: number) {
    const known = await this.registrations
      .findOne({ orders: orderId })
      .lean<ExpeditionDoc>();
    if (!known) return false;
    if (amountPaise != null && amountPaise !== known.fee * 100) {
      this.log.warn(
        `order ${orderId}: paid ${amountPaise} paise, expected ${known.fee * 100}`,
      );
      return true;
    }
    const paid = await this.registrations
      .findOneAndUpdate(
        { _id: known._id, status: { $ne: 'paid' } },
        {
          $set: {
            status: 'paid',
            paidAt: new Date(),
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
          },
          $unset: { failureReason: 1 },
        },
        { new: true },
      )
      .lean<ExpeditionDoc>();
    if (!paid) {
      if (known.razorpayPaymentId && known.razorpayPaymentId !== paymentId) {
        this.log.warn(
          `order ${orderId}: second payment ${paymentId} for ${String(known._id)}; flagged for refund`,
        );
        await this.registrations.updateOne(
          { _id: known._id },
          { $set: { needsRefund: true } },
        );
      }
      return true;
    }
    const regId = await this.nextRegId();
    await this.registrations.updateOne({ _id: paid._id }, { $set: { regId } });
    background('expedition confirmation', () =>
      this.sendConfirmation({ ...paid, regId }),
    );
    return true;
  }

  /** SSD-0001, SSD-0002 … one atomic step, so two payments never share a number. */
  private async nextRegId() {
    const doc = await this.counters
      .findOneAndUpdate(
        { key: 'registration' },
        { $inc: { value: 1 } },
        { upsert: true, new: true },
      )
      .lean<{ value: number }>();
    return `SSD-${String(doc?.value ?? 1).padStart(4, '0')}`;
  }

  async markFailed(orderId: string, reason: string) {
    await this.registrations.updateOne(
      { orders: orderId, status: 'pending' },
      { $set: { status: 'failed', failureReason: reason.slice(0, 200) } },
    );
  }

  /**
   * The browser's success callback from Razorpay Checkout, asked again while the page waits. A wrong
   * signature changes nothing; a valid one is checked with Razorpay before the order is marked paid.
   */
  async confirmFromCheckout(input: {
    orderId?: unknown;
    paymentId?: unknown;
    signature?: unknown;
  }) {
    const orderId = text(input.orderId, 64);
    const paymentId = text(input.paymentId, 64);
    const signature = text(input.signature, 256);
    if (!orderId || !paymentId || !signature)
      throw new FormError('The payment details are incomplete.');
    if (!checkoutSignatureValid(orderId, paymentId, signature)) {
      this.log.warn(`invalid checkout signature for order ${orderId}`);
      throw new FormError(
        "We couldn't confirm this payment. If money was taken, it will show as paid within a few minutes.",
      );
    }
    let doc = await this.registrations
      .findOne({ orders: orderId })
      .lean<ExpeditionDoc>();
    if (doc && doc.status !== 'paid') {
      await this.settle(doc, orderId, paymentId);
      doc = await this.registrations
        .findOne({ _id: doc._id })
        .lean<ExpeditionDoc>();
    }
    const paid = doc?.status === 'paid' && Boolean(doc.regId);
    return {
      paid,
      receiptToken:
        paid && doc
          ? createToken(
              'expedition-receipt',
              String(doc._id),
              RECEIPT_DAYS * DAY,
            )
          : null,
    };
  }

  private async settle(doc: ExpeditionDoc, orderId: string, paymentId: string) {
    try {
      let payment = await fetchPayment(paymentId);
      if (
        payment.order_id !== orderId ||
        payment.amount !== doc.fee * 100 ||
        payment.currency !== 'INR'
      ) {
        this.log.warn(`payment ${paymentId} doesn't match order ${orderId}`);
        return;
      }
      if (payment.status === 'authorized')
        payment = await capturePayment(paymentId, payment.amount);
      if (payment.status === 'captured')
        await this.markPaid(orderId, paymentId, payment.amount);
    } catch (err) {
      this.log.error(`checking payment ${paymentId} with Razorpay failed`, err);
    }
  }

  /** What the thank-you screen and the receipt PDF show. The Zoom link is only ever given here, after payment. */
  async receipt(token: unknown) {
    const ref = readToken(text(token, 512), 'expedition-receipt');
    const doc =
      ref && isValidObjectId(ref.id)
        ? await this.registrations
            .findOne({ _id: ref.id, status: 'paid' })
            .lean<ExpeditionDoc>()
        : null;
    if (!doc?.regId) return null;
    const s = await this.settings();
    return {
      regId: doc.regId,
      name: doc.name,
      whatsapp: doc.whatsapp,
      district: doc.district,
      age: doc.age,
      gender: doc.gender,
      fee: doc.fee,
      paidAt: doc.paidAt ?? null,
      razorpayOrderId: doc.razorpayOrderId ?? '',
      razorpayPaymentId: doc.razorpayPaymentId ?? '',
      zoomLink: s.zoomLink,
    };
  }

  /** "Send the Zoom link again" on the public page, for a number that has paid. Capped per registration. */
  async resendFromPage(input: { whatsapp?: unknown }) {
    const mobile = digits(input.whatsapp);
    const doc = MOBILE.test(mobile)
      ? await this.registrations
          .findOne({ whatsapp: `+91${mobile}`, status: 'paid' })
          .lean<ExpeditionDoc>()
      : null;
    if (!doc) throw new FormError('This number is not registered yet.');
    if ((doc.resends ?? 0) >= PUBLIC_RESENDS)
      throw tooMany(
        'The link has been sent to this number several times already. Please check WhatsApp.',
      );
    // Only a message that went out makes the person wait; a refused one can be tried again at once.
    if (
      doc.message?.at &&
      DELIVERED.includes(doc.message.status ?? '') &&
      doc.message.at > since(RESEND_GAP_MS)
    )
      throw tooMany(
        'The link was sent a moment ago. Please check WhatsApp, then try again in 2 minutes.',
      );
    await this.registrations.updateOne(
      { _id: doc._id },
      { $inc: { resends: 1 } },
    );
    const status = await this.sendConfirmation(doc);
    return { status, to: masked(doc.whatsapp) };
  }

  /** "Send again" for one person, from the admin. */
  async resendFromAdmin(input: { id?: unknown }) {
    const id = text(input.id, 24);
    const doc = isValidObjectId(id)
      ? await this.registrations.findOne({ _id: id }).lean<ExpeditionDoc>()
      : null;
    if (!doc) throw new FormError('This registration was not found.');
    if (doc.status !== 'paid')
      throw new FormError(
        'The fee is not paid yet, so the Zoom link is not sent.',
      );
    const s = await this.settings(true);
    if (!s.zoomLink)
      throw new FormError(
        'Add the Zoom link in the Yatra settings first, then send again.',
      );
    const status = await this.sendConfirmation(doc, s);
    if (status === 'skipped')
      throw new FormError('WhatsApp is not set up on the server yet.');
    if (status === 'failed')
      throw new FormError(
        'WhatsApp could not send the message. Open the person to see the reason.',
      );
    return { status };
  }

  /**
   * One press of "Send to all" in the admin. `kind` "link" sends the confirmation to paid people who
   * have not got it yet; "reminder" sends the meeting-day reminder to every paid person. It works for
   * a few seconds, then says how many are left, so the Admin presses again until it reaches zero.
   */
  async sendToAll(input: { kind?: unknown }) {
    const kind = input.kind === 'reminder' ? 'reminder' : 'link';
    const s = await this.settings(true);
    if (!s.zoomLink)
      throw new FormError('Add the Zoom link in the Yatra settings first.');
    if (!this.messaging.whatsappReady)
      throw new FormError('WhatsApp is not set up on the server yet.');
    const started = new Date();
    const field = kind === 'link' ? 'message' : 'reminder';
    // People this press has not tried yet: each is tried once, so a number WhatsApp refuses is not retried in a loop.
    const waiting = {
      status: 'paid',
      $and: [
        kind === 'link'
          ? { 'message.status': { $nin: ['sent', 'delivered', 'read'] } }
          : {
              $or: [
                { 'reminder.at': { $exists: false } },
                { 'reminder.at': { $lt: since(REMINDER_GAP_MS) } },
              ],
            },
        {
          $or: [
            { [`${field}.at`]: { $exists: false } },
            { [`${field}.at`]: { $lt: started } },
          ],
        },
      ],
    };
    const until = Date.now() + BULK_BUDGET_MS;
    let sent = 0;
    let failed = 0;
    while (Date.now() < until) {
      const batch = await this.registrations
        .find(waiting)
        .sort({ paidAt: 1 })
        .limit(BULK_AT_ONCE)
        .lean<ExpeditionDoc[]>();
      if (!batch.length) break;
      const results = await Promise.all(
        batch.map((doc) =>
          kind === 'link'
            ? this.sendConfirmation(doc, s)
            : this.sendReminder(doc, s),
        ),
      );
      const ok = results.filter((r) => r === 'sent').length;
      sent += ok;
      failed += results.length - ok;
    }
    return {
      sent,
      failed,
      left: await this.registrations.countDocuments(waiting),
    };
  }

  /** Delivery ticks from Meta for messages this module sent. */
  async whatsappStatus(providerId: string, status: DeliveryStatus) {
    const lower = REPLACES[status];
    if (!lower.length) return;
    for (const field of ['message', 'reminder'] as const)
      await this.registrations.updateOne(
        {
          [`${field}.providerId`]: providerId,
          [`${field}.status`]: { $in: lower },
        },
        { $set: { [`${field}.status`]: status } },
      );
  }

  private async sendConfirmation(
    doc: ExpeditionDoc,
    given?: ExpeditionSettings,
  ) {
    const s = given ?? (await this.settings(true));
    if (!s.zoomLink || !doc.regId) {
      await this.saveMessage(doc, 'message', { status: 'waiting' });
      return 'waiting' as const;
    }
    const result = await this.messaging.whatsapp({
      to: doc.whatsapp,
      template: TEMPLATE_CONFIRMED,
      params: [doc.name, doc.regId, s.zoomLink],
    });
    await this.saveMessage(doc, 'message', result);
    return result.status;
  }

  private async sendReminder(doc: ExpeditionDoc, s: ExpeditionSettings) {
    const result = await this.messaging.whatsapp({
      to: doc.whatsapp,
      template: TEMPLATE_REMINDER,
      params: [doc.name, s.zoomLink, doc.regId ?? ''],
    });
    await this.saveMessage(doc, 'reminder', result);
    return result.status;
  }

  private async saveMessage(
    doc: ExpeditionDoc,
    field: 'message' | 'reminder',
    result: SendResult | { status: 'waiting' },
  ) {
    const value: ExpeditionMessage = { status: result.status, at: new Date() };
    if ('providerId' in result && result.providerId)
      value.providerId = result.providerId;
    if ('error' in result && result.error)
      value.error = result.error.slice(0, 300);
    if (result.status === 'failed')
      this.log.warn(
        `${field} to ${String(doc._id)} failed: ${value.error ?? 'no reason given'}`,
      );
    await this.registrations.updateOne(
      { _id: doc._id },
      { $set: { [field]: value } },
    );
  }
}
