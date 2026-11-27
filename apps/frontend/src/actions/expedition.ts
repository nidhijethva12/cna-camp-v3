"use server";

import type { CheckoutOrder } from "@/actions/olympiad/register";
import { callBackend } from "@/lib/olympiad/backend";

export type ExpeditionField = "name" | "whatsapp" | "district" | "age" | "gender" | "agree";

export interface ExpeditionFormInput {
  name: string;
  whatsapp: string;
  district: string;
  age: string;
  gender: string;
  agree: boolean;
  /** The hidden field only bots fill in. */
  website: string;
  turnstileToken: string;
}

export interface ExpeditionOrder {
  name: string;
  fee: number;
  order: CheckoutOrder;
  prefill: { name: string; email: string; contact: string };
}

export type ExpeditionRegisterResult =
  | ({ ok: true } & ExpeditionOrder)
  | { ok: false; message: string; fieldErrors?: Partial<Record<ExpeditionField, string>>; alreadyRegistered?: boolean };

/** Saves the form and opens the Razorpay order for the registration fee. */
export async function registerForExpedition(input: ExpeditionFormInput): Promise<ExpeditionRegisterResult> {
  const result = await callBackend<ExpeditionOrder>("/expedition/registrations", {
    body: {
      name: String(input.name).slice(0, 80),
      whatsapp: String(input.whatsapp).slice(0, 20),
      district: String(input.district).slice(0, 60),
      age: Number(input.age),
      gender: String(input.gender).slice(0, 20),
      agree: input.agree === true,
      website: String(input.website ?? "").slice(0, 200),
      turnstileToken: String(input.turnstileToken ?? "").slice(0, 2048),
    },
  });
  if (result.ok) {
    const { name, fee, order, prefill } = result.data;
    return { ok: true, name, fee, order, prefill };
  }
  return { ok: false, message: result.message, fieldErrors: result.fieldErrors, alreadyRegistered: result.status === 409 };
}

export type ExpeditionConfirmation = { ok: true; paid: boolean; receiptToken: string | null } | { ok: false; message: string };

/** After Razorpay Checkout reports success: the API verifies the payment and says whether it is confirmed yet. */
export async function confirmExpeditionPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ExpeditionConfirmation> {
  const result = await callBackend<{ paid: boolean; receiptToken: string | null }>("/expedition/payments/confirm", {
    body: {
      orderId: String(input.orderId).slice(0, 64),
      paymentId: String(input.paymentId).slice(0, 64),
      signature: String(input.signature).slice(0, 256),
    },
  });
  return result.ok ? { ok: true, paid: result.data.paid, receiptToken: result.data.receiptToken } : { ok: false, message: result.message };
}

export interface ExpeditionReceipt {
  regId: string;
  name: string;
  whatsapp: string;
  district: string;
  age: number;
  gender: string;
  fee: number;
  paidAt: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  /** Empty until the organiser adds it in the admin. Only ever sent to someone who has paid. */
  zoomLink: string;
}

/** The paid registration behind a receipt link; null when the link is wrong. */
export async function getExpeditionReceipt(token: string): Promise<ExpeditionReceipt | null> {
  const result = await callBackend<ExpeditionReceipt>("/expedition/receipts", { body: { token: String(token).slice(0, 512) } });
  return result.ok ? result.data : null;
}

export type ExpeditionResend = { ok: true; status: "sent" | "waiting" | "skipped" | "failed"; to: string } | { ok: false; message: string };

/** "Send the Zoom link again" for a number that has already paid. */
export async function resendExpeditionLink(whatsapp: string): Promise<ExpeditionResend> {
  const result = await callBackend<{ status: "sent" | "waiting" | "skipped" | "failed"; to: string }>("/expedition/resend", {
    body: { whatsapp: String(whatsapp).slice(0, 20) },
  });
  return result.ok ? { ok: true, ...result.data } : { ok: false, message: result.message };
}
