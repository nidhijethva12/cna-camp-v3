"use server";

import { callBackend } from "@/lib/olympiad/backend";
import type { ReceiptData } from "@/lib/olympiad/receipt";

/** The receipt behind a receipt link; null when the link is wrong or the registration isn't complete yet. */
export async function getReceipt(token: string): Promise<ReceiptData | null> {
  const result = await callBackend<ReceiptData>("/olympiad/receipts", { body: { token: String(token).slice(0, 512) } });
  return result.ok ? result.data : null;
}
