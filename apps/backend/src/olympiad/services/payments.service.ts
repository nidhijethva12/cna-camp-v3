import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { config } from '../../config.js';
import { background, FormError, text } from '../../common/forms.js';
import {
  capturePayment,
  checkoutSignatureValid,
  createOrder,
  fetchPayment,
  razorpayReady,
} from '../razorpay.js';
import { hasRegId, receiptToken } from '../registration-ids.js';
import { MODELS, type PaymentDoc, type PersonDoc } from '../schemas.js';
import { readToken } from '../tokens.js';
import { CountersService } from './counters.service.js';
import { NotifyService } from './notify.service.js';

/** What the website needs to open Razorpay Checkout; null while Razorpay isn't set up yet. */
export type CheckoutOrder = {
  orderId: string;
  amount: number;
  keyId: string;
} | null;

/** Razorpay orders and their outcome: paid (verified Checkout callback or Razorpay's webhook) or failed. */
@Injectable()
export class PaymentsService {
  private readonly log = new Logger('Payments');

  constructor(
    @InjectModel(MODELS.payment) private readonly payments: Model<PaymentDoc>,
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
    private readonly counters: CountersService,
    private readonly notify: NotifyService,
  ) {}

  /** Opens an order for unpaid people and links them to it. The amount comes from their stored fees. */
  async openOrder(
    people: PersonDoc[],
    receipt: string,
    paidBy: 'participant' | 'school',
    school?: Types.ObjectId,
  ): Promise<CheckoutOrder> {
    if (!razorpayReady()) return null;
    const amount = people.reduce((sum, p) => sum + (p.fee ?? 0), 0) * 100;
    const order = await createOrder(amount, receipt, {
      people: people
        .map((p) => p.name)
        .join(', ')
        .slice(0, 250),
    });
    const payment = await this.payments.create({
      razorpayOrderId: order.id,
      receipt,
      amount,
      status: 'created',
      mode: people.length > 1 ? 'bulk' : 'single',
      paidBy,
      people: people.map((p) => p._id),
      ...(school ? { school } : {}),
    });
    await this.people.updateMany(
      {
        _id: { $in: people.map((p) => p._id) },
        paymentStatus: { $nin: ['paid', 'free'] },
      },
      { $set: { payment: payment._id, paymentStatus: 'pending' } },
    );
    return { orderId: order.id, amount, keyId: config.razorpay.keyId! };
  }

  /**
   * Marks an order paid exactly once, from the verified Checkout callback or Razorpay's webhook. Both
   * can arrive, and Razorpay can send the same event more than once; the atomic "not paid yet" claim
   * lets only one continue, so people are updated and messaged once. `amountPaise`, when given,
   * must equal the order amount.
   * Only people for whom this is still the current, unpaid order become paid: money for an order
   * someone has since replaced, or a second payment, is flagged for a refund instead.
   */
  async markPaid(orderId: string, paymentId: string, amountPaise?: number) {
    const paidAt = new Date();
    const order = await this.payments
      .findOneAndUpdate(
        {
          razorpayOrderId: orderId,
          status: { $ne: 'paid' },
          ...(amountPaise != null ? { amount: amountPaise } : {}),
        },
        { $set: { status: 'paid', razorpayPaymentId: paymentId, paidAt } },
        { new: true },
      )
      .lean<PaymentDoc>();
    if (!order) return false;
    const current = {
      _id: { $in: order.people },
      payment: order._id,
      paymentStatus: { $nin: ['paid', 'free'] },
    };
    const owed = await this.people.find(current).select('_id').lean();
    if (owed.length < order.people.length) {
      this.log.warn(
        `order ${orderId}: ${order.people.length - owed.length} of ${order.people.length} people no longer owed it; flagged for refund`,
      );
      await this.payments.updateOne(
        { _id: order._id },
        { $set: { needsRefund: true } },
      );
    }
    if (!owed.length) return true;
    await this.people.updateMany(
      { ...current, _id: { $in: owed.map((p) => p._id) } },
      {
        $set: {
          paymentStatus: 'paid',
          paidAt,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
        },
      },
    );
    // Each newly paid person gets their Registration ID now, from the one counter for all groups.
    // Someone who already has one keeps it.
    for (const person of await this.people
      .find({
        _id: { $in: owed.map((p) => p._id) },
        razorpayPaymentId: paymentId,
      })
      .select('regId group')
      .lean<PersonDoc[]>()) {
      if (hasRegId(person)) continue;
      await this.people.updateOne(
        { _id: person._id, regId: { $not: /^AO2-/ } },
        {
          $set: {
            regId: await this.counters.registrationId(person.group ?? ''),
          },
        },
      );
    }
    const paid = await this.people
      .find({
        _id: { $in: owed.map((p) => p._id) },
        razorpayPaymentId: paymentId,
      })
      .lean<PersonDoc[]>();
    background('registration confirmations', async () => {
      for (const person of paid)
        await this.notify.registrationConfirmed(person);
    });
    return true;
  }

  /** A failed attempt marks people still waiting on this order as failed; they can try again. */
  async markFailed(orderId: string, reason: string) {
    const order = await this.payments
      .findOneAndUpdate(
        { razorpayOrderId: orderId, status: 'created' },
        { $set: { status: 'failed', failureReason: reason.slice(0, 200) } },
        { new: true },
      )
      .lean<PaymentDoc>();
    if (order)
      await this.people.updateMany(
        {
          _id: { $in: order.people },
          payment: order._id,
          paymentStatus: { $nin: ['paid', 'free'] },
        },
        { $set: { paymentStatus: 'failed' } },
      );
  }

  /**
   * After a valid Checkout signature: asks Razorpay for the payment, captures it if the account
   * leaves payments authorized, and marks the order paid once it is captured for this order at the
   * full amount. Never throws: if Razorpay can't be reached, the page asks again (and the webhook,
   * when set up, still completes it). Returns whether this call marked the order paid.
   */
  private async settle(order: PaymentDoc, paymentId: string): Promise<boolean> {
    try {
      let payment = await fetchPayment(paymentId);
      if (
        payment.order_id !== order.razorpayOrderId ||
        payment.amount !== order.amount ||
        payment.currency !== 'INR'
      ) {
        this.log.warn(
          `payment ${paymentId} doesn't match order ${order.razorpayOrderId} (${payment.order_id}, ${payment.amount} ${payment.currency})`,
        );
        return false;
      }
      if (payment.status === 'authorized')
        payment = await capturePayment(paymentId, order.amount);
      if (payment.status !== 'captured') return false;
      return await this.markPaid(
        order.razorpayOrderId,
        paymentId,
        payment.amount,
      );
    } catch (err) {
      this.log.error(`checking payment ${paymentId} with Razorpay failed`, err);
      return false;
    }
  }

  /**
   * The browser's success callback from Razorpay Checkout (razorpay_order_id, razorpay_payment_id,
   * razorpay_signature), asked again while the page waits. A signature that isn't
   * HMAC-SHA256(order_id|payment_id, key secret) is a 400 and nothing changes. A valid one is checked
   * with Razorpay (`settle`) and marks the order paid, so payments complete without the webhook;
   * the webhook, when set up, does the same for people who close the tab first.
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
    let order = await this.payments
      .findOne({ razorpayOrderId: orderId })
      .lean<PaymentDoc>();
    if (order && order.status !== 'paid') {
      await this.settle(order, paymentId);
      // Read again: this call or a webhook arriving meanwhile may have marked it paid.
      order = await this.payments
        .findOne({ razorpayOrderId: orderId })
        .lean<PaymentDoc>();
    }
    const people = order
      ? await this.people
          .find({ _id: { $in: order.people } })
          .select('regId name group paidAt razorpayPaymentId paymentStatus')
          .lean<PersonDoc[]>()
      : [];
    const paid = order?.status === 'paid';
    return {
      paid,
      paymentId: order?.razorpayPaymentId ?? paymentId,
      paidAt: order?.paidAt ?? null,
      amount: (order?.amount ?? 0) / 100,
      people: people.map((p) => ({
        regId: hasRegId(p) ? p.regId! : '',
        name: p.name,
        group: p.group ?? '',
        // The receipt is ready once the payment is confirmed and the Registration ID given.
        receiptToken: paid && hasRegId(p) ? receiptToken(p) : null,
      })),
    };
  }

  /** "Pay now" from the fee-pending message: a fresh order for one unpaid registration. */
  async resume(token: unknown) {
    const ref = readToken(text(token, 512), 'pay');
    const person = ref
      ? await this.people
          .findOne({ _id: ref.id, type: 'registered' })
          .lean<PersonDoc>()
      : null;
    if (!person)
      throw new FormError(
        'This payment link is not valid any more. Please register again or contact CNA.',
      );
    const summary = {
      regId: hasRegId(person) ? person.regId! : '',
      name: person.name,
      group: person.group ?? '',
      fee: person.fee ?? 0,
      email: person.email ?? '',
      whatsapp: person.whatsapp,
    };
    if (person.paymentStatus === 'paid' || person.paymentStatus === 'free')
      return {
        ...summary,
        paid: true,
        order: null,
        receiptToken: hasRegId(person) ? receiptToken(person) : null,
      };
    return {
      ...summary,
      paid: false,
      order:
        (await this.openOrderFor(person)) ??
        (await this.openOrder(
          [person],
          `form-${String(person._id)}`,
          'participant',
        )),
    };
  }

  /**
   * The registration receipt: everything the PDF shows, for a paid or free registration that has its
   * Registration ID. Null for an unknown link or a registration that isn't complete yet.
   */
  async receipt(token: unknown) {
    const ref = readToken(text(token, 512), 'receipt');
    const p = ref
      ? await this.people
          .findOne({ _id: ref.id, type: 'registered' })
          .lean<PersonDoc>()
      : null;
    if (
      !p ||
      !hasRegId(p) ||
      (p.paymentStatus !== 'paid' && p.paymentStatus !== 'free')
    )
      return null;
    return {
      regId: p.regId!,
      name: p.name,
      group: p.group ?? '',
      participant: p.participant ?? '',
      dob: p.dob ?? '',
      mobile: p.mobile ?? '',
      whatsapp: p.whatsapp,
      email: p.email ?? '',
      institution: p.institution ?? '',
      stage: p.stage ?? '',
      schoolType: p.schoolType ?? '',
      district: p.district ?? '',
      pin: p.pin ?? '',
      quizLanguage: p.quizLanguage ?? '',
      quizWindow: p.quizWindow ?? '',
      quizDate: p.quizDate ?? '',
      quizTime: p.quizTime ?? '',
      guardian: p.parentName
        ? {
            relation: p.parentRelation ?? '',
            name: p.parentName,
            phone: p.parentPhone ?? '',
          }
        : null,
      fee: p.fee ?? 0,
      status: p.paymentStatus,
      registeredAt: p.registeredAt ?? null,
      paidAt: p.paidAt ?? null,
      razorpayOrderId: p.razorpayOrderId ?? '',
      razorpayPaymentId: p.razorpayPaymentId ?? '',
      rulesVersion: p.rules?.version ?? '',
    };
  }

  /**
   * The person's own order that is still waiting for payment, at today's fee. Opening the pay link
   * again (a refresh, a second tab, a link scanner) reuses it, so a payment made in an earlier tab
   * still matches the person's current order.
   */
  private async openOrderFor(person: PersonDoc): Promise<CheckoutOrder> {
    if (!person.payment || !razorpayReady()) return null;
    const open = await this.payments
      .findOne({
        _id: person.payment,
        status: 'created',
        amount: (person.fee ?? 0) * 100,
        people: [person._id],
      })
      .lean<PaymentDoc>();
    return open
      ? {
          orderId: open.razorpayOrderId,
          amount: open.amount,
          keyId: config.razorpay.keyId!,
        }
      : null;
  }
}
