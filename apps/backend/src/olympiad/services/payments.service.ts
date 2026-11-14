import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { config } from '../../config.js';
import { background, FormError, text } from '../../common/forms.js';
import {
  checkoutSignatureValid,
  createOrder,
  razorpayReady,
} from '../razorpay.js';
import { MODELS, type PaymentDoc, type PersonDoc } from '../schemas.js';
import { readToken } from '../tokens.js';
import { NotifyService } from './notify.service.js';

/** What the website needs to open Razorpay Checkout; null while Razorpay isn't set up yet. */
export type CheckoutOrder = {
  orderId: string;
  amount: number;
  keyId: string;
} | null;

/** Razorpay orders and their outcome: paid (from Razorpay's webhook only) or failed. */
@Injectable()
export class PaymentsService {
  private readonly log = new Logger('Payments');

  constructor(
    @InjectModel(MODELS.payment) private readonly payments: Model<PaymentDoc>,
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
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
      regIds: people
        .map((p) => p.regId)
        .join(',')
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
   * Marks an order paid exactly once, from Razorpay's webhook. Razorpay can send the same event more
   * than once; the atomic "not paid yet" claim lets only one continue, so people are updated and
   * messaged once. `amountPaise`, when given (the webhook), must equal the order amount.
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
        $set: { paymentStatus: 'paid', paidAt, razorpayPaymentId: paymentId },
      },
    );
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
   * The browser's success callback from Razorpay Checkout, asked again while the page waits. The
   * signature proves the payment is real, but only Razorpay's webhook marks it paid; this reports
   * whether that has happened yet.
   */
  async confirmFromCheckout(input: {
    orderId?: unknown;
    paymentId?: unknown;
    signature?: unknown;
  }) {
    const orderId = text(input.orderId, 64);
    const paymentId = text(input.paymentId, 64);
    if (
      !checkoutSignatureValid(orderId, paymentId, text(input.signature, 256))
    ) {
      this.log.warn(`invalid checkout signature for order ${orderId}`);
      throw new FormError(
        "We couldn't confirm this payment. If money was taken, it will show as paid within a few minutes.",
      );
    }
    const order = await this.payments
      .findOne({ razorpayOrderId: orderId })
      .lean<PaymentDoc>();
    const people = order
      ? await this.people
          .find({ _id: { $in: order.people } })
          .select('regId name group paidAt razorpayPaymentId')
          .lean<PersonDoc[]>()
      : [];
    return {
      paid: order?.status === 'paid',
      paymentId: order?.razorpayPaymentId ?? paymentId,
      paidAt: order?.paidAt ?? null,
      amount: (order?.amount ?? 0) / 100,
      people: people.map((p) => ({
        regId: p.regId,
        name: p.name,
        group: p.group ?? '',
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
      regId: person.regId,
      name: person.name,
      group: person.group ?? '',
      fee: person.fee ?? 0,
      email: person.email ?? '',
      whatsapp: person.whatsapp,
    };
    if (person.paymentStatus === 'paid' || person.paymentStatus === 'free')
      return { ...summary, paid: true, order: null };
    return {
      ...summary,
      paid: false,
      order:
        (await this.openOrderFor(person)) ??
        (await this.openOrder([person], person.regId, 'participant')),
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
