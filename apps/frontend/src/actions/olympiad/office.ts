"use server";

import { revalidatePath } from "next/cache";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { callBackend } from "@/lib/olympiad/backend";
import { OFFICE_METHODS, type OfficeMethod } from "@/lib/olympiad/officePayments";
import { currentStaff } from "@/lib/olympiad/staff";

export type OfficePaymentResult = { ok: true; regId: string; receiptToken: string | null } | { ok: false; message: string };

/**
 * An Admin records a fee taken at the CNA office (cash, UPI, bank transfer or cheque). The Olympiad
 * API then confirms the registration exactly as after an online payment.
 */
export async function recordOfficePayment(input: { id: string; method: OfficeMethod; reference: string }): Promise<OfficePaymentResult> {
  const staff = await currentStaff();
  if (!staff) return { ok: false, message: "Your admin login has ended. Log in to the admin again." };
  if (!staff.canRecordPayments) return { ok: false, message: "Only an Admin can record a payment." };
  if (!/^[a-f0-9]{24}$/.test(input.id) || !OFFICE_METHODS.includes(input.method))
    return { ok: false, message: "Choose how the fee was paid." };
  const result = await callBackend<{ regId: string; receiptToken: string | null }>("/olympiad/payments/office", {
    body: { id: input.id, method: input.method, reference: String(input.reference ?? "").slice(0, 120), by: staff.email },
  });
  if (!result.ok) return { ok: false, message: result.message };
  revalidatePath("/admin/collections/olympiad-people");
  return { ok: true, ...result.data };
}

export type OfficeOrderResult =
  | {
      ok: true;
      regId: string;
      name: string;
      group: string;
      fee: number;
      order: CheckoutOrder;
      prefill: { name: string; email: string; contact: string };
    }
  | { ok: false; message: string };

/** "Pay online" for a registration staff filled in at the office: the order Razorpay Checkout opens with. */
export async function officeOnlineOrder(id: string): Promise<OfficeOrderResult> {
  const staff = await currentStaff();
  if (!staff) return { ok: false, message: "Your admin login has ended. Log in to the admin again." };
  if (!/^[a-f0-9]{24}$/.test(id)) return { ok: false, message: "This registration was not found." };
  const result = await callBackend<Omit<Extract<OfficeOrderResult, { ok: true }>, "ok">>("/olympiad/payments/office/order", {
    body: { id },
  });
  if (!result.ok) return { ok: false, message: result.message };
  const { regId, name, group, fee, order, prefill } = result.data;
  return { ok: true, regId, name, group, fee, order, prefill };
}
