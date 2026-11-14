"use server";

import { olympiadPhaseText } from "@/content/olympiadPhase";
import { callBackend } from "@/lib/olympiad/backend";
import { antiSpam, checked, field, toFormState, type FormState } from "@/lib/olympiad/forms";

export type RemindField = "name" | "whatsapp" | "email" | "interest" | "consent";
export type RemindState = FormState<RemindField, { firstName: string; whatsapp: string; email: string; already: boolean }>;

/** "Remind me on WhatsApp": the Olympiad API saves the reminder and sends the confirmations. */
export async function submitReminder(_prev: RemindState, fd: FormData): Promise<RemindState> {
  const t = olympiadPhaseText[fd.get("lang") === "gu" ? "gu" : "en"].remind.errors;
  const values = {
    name: field(fd, "name", 80),
    whatsapp: field(fd, "whatsapp", 20),
    email: field(fd, "email", 120),
    interest: field(fd, "interest", 10),
  };
  const result = await callBackend<NonNullable<RemindState["data"]>>("/olympiad/reminders", {
    body: { ...values, consent: checked(fd, "consent"), ...antiSpam(fd) },
  });
  const state = toFormState<RemindField, NonNullable<RemindState["data"]>>(result, values);
  if (state.status !== "error" || !state.fieldErrors) return state;
  // The API answers in English; field messages are shown in the page's language.
  const fieldErrors = Object.fromEntries(Object.keys(state.fieldErrors).map((f) => [f, t[f as RemindField] ?? t.check]));
  return { ...state, message: t.check, fieldErrors };
}
