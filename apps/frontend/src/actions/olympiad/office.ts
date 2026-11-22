"use server";

import { revalidatePath } from "next/cache";
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
