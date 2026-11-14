"use server";

import { callBackend } from "@/lib/olympiad/backend";

export type LinkState = { status: "idle" | "done" | "error"; message?: string };

const token = (fd: FormData) => String(fd.get("token") ?? "").slice(0, 512);

/** Stops Olympiad emails for the person the link belongs to. */
export async function unsubscribe(_prev: LinkState, fd: FormData): Promise<LinkState> {
  const result = await callBackend("/olympiad/links/unsubscribe", { body: { token: token(fd) } });
  return result.ok ? { status: "done" } : { status: "error", message: result.message };
}

/** A parent confirms consent for their child from the WhatsApp link. */
export async function giveConsent(_prev: LinkState, fd: FormData): Promise<LinkState> {
  const result = await callBackend("/olympiad/links/consent", { body: { token: token(fd) } });
  return result.ok ? { status: "done" } : { status: "error", message: result.message };
}
