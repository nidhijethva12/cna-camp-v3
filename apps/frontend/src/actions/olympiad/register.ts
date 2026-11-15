"use server";

import { callBackend } from "@/lib/olympiad/backend";

/** What Razorpay Checkout needs; null while payments aren't set up yet. */
export type CheckoutOrder = { orderId: string; amount: number; keyId: string } | null;

export type PaymentConfirmation =
  | {
      ok: true;
      /** True once the order is marked paid (this verified callback or Razorpay's webhook). */
      paid: boolean;
      paymentId: string;
      paidAt: string | null;
      amount: number;
      /** Each person on the order; the Registration ID and receipt link once the payment is confirmed. */
      people: { regId: string; name: string; group: string; receiptToken: string | null }[];
    }
  | { ok: false; message: string };

/**
 * Razorpay Checkout's success callback, asked again while the page waits. The API checks Razorpay's
 * signature (a mismatch is an error and nothing is marked paid), confirms the payment with Razorpay,
 * marks the order paid and says whether it is paid yet.
 */
export async function confirmPayment(input: { orderId: string; paymentId: string; signature: string }): Promise<PaymentConfirmation> {
  const result = await callBackend<Omit<Extract<PaymentConfirmation, { ok: true }>, "ok">>("/olympiad/payments/confirm", {
    body: {
      orderId: String(input.orderId).slice(0, 64),
      paymentId: String(input.paymentId).slice(0, 64),
      signature: String(input.signature).slice(0, 256),
    },
  });
  return result.ok ? { ok: true, ...result.data } : { ok: false, message: result.message };
}
