"use server";

import { revalidatePath } from "next/cache";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { callBackend } from "@/lib/olympiad/backend";
import { sessionToken } from "@/lib/olympiad/session";
import { readSheet } from "@/lib/olympiad/studentSheet";

export interface ImportState {
  status: "idle" | "success" | "error";
  message?: string;
  added?: number;
  emailed?: number;
  skipped?: { row: number; reason: string }[];
}

const MAX_FILE_BYTES = 2 * 1024 * 1024;

/** "Upload Excel": reads the sheet here and sends the rows to the Olympiad API, which checks each one. */
export async function importStudents(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const session = await sessionToken();
  if (!session) return { status: "error", message: "Your login has ended. Please log in again." };
  const file = fd.get("sheet");
  if (!(file instanceof File) || !file.size) return { status: "error", message: "Choose the Excel file to upload." };
  if (file.size > MAX_FILE_BYTES || !/\.(xlsx|csv)$/i.test(file.name))
    return { status: "error", message: "Upload the template as an .xlsx (or .csv) file, up to 2 MB." };

  let rows;
  try {
    rows = await readSheet(file);
  } catch (err) {
    console.error("[olympiad] reading a school sheet failed", err);
    return { status: "error", message: "This file could not be read. Download the template, fill it and upload it again." };
  }
  if (!rows.length)
    return { status: "error", message: "No students found in the file. Fill the rows under the headings and upload again." };
  if (rows.length > 500) return { status: "error", message: "Up to 500 students per upload. Split the sheet into parts." };

  const result = await callBackend<{ added: number; emailed: number; skipped: { row: number; reason: string }[] }>(
    "/olympiad/partners/school/students",
    { body: { rows }, session },
  );
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/school-dashboard");
  return { status: "success", ...result.data };
}

export type SchoolPayResult =
  | { ok: true; order: CheckoutOrder; count: number; amount: number; prefill: { name: string; email: string; contact: string } }
  | { ok: false; message: string };

/** "Pay for N pending students": one Razorpay order for every student the school still owes for. */
export async function payForStudents(): Promise<SchoolPayResult> {
  const session = await sessionToken();
  if (!session) return { ok: false, message: "Your login has ended. Please log in again." };
  const result = await callBackend<Omit<Extract<SchoolPayResult, { ok: true }>, "ok">>("/olympiad/partners/school/pay", {
    method: "POST",
    session,
  });
  return result.ok ? { ok: true, ...result.data } : { ok: false, message: result.message };
}
