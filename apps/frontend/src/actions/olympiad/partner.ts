"use server";

import { partnerPageText, type PartnerKind } from "@/content/partnerPages";
import { apiMessage } from "@/content/dashboards";
import { callBackend } from "@/lib/olympiad/backend";
import { dashboardLanguage } from "@/lib/olympiad/dashboardLanguage";
import { antiSpam, checked, field, type FormState } from "@/lib/olympiad/forms";

export type SignupField =
  | "name"
  | "udise"
  | "type"
  | "district"
  | "principal"
  | "coordinatorName"
  | "coordinatorWhatsapp"
  | "whatsapp"
  | "city"
  | "role"
  | "email"
  | "consent";

export type SignupState = FormState<SignupField, { firstName: string; status: "waiting" | "approved" }>;

const FIELDS: Record<PartnerKind, SignupField[]> = {
  school: ["name", "udise", "type", "district", "principal", "coordinatorName", "coordinatorWhatsapp", "email"],
  ambassador: ["name", "whatsapp", "city", "role", "email"],
};

/** "Send for approval" / "Join as Ambassador": the Olympiad API saves the partner as waiting for approval. */
export async function signupPartner(_prev: SignupState, fd: FormData): Promise<SignupState> {
  const kind: PartnerKind = fd.get("kind") === "school" ? "school" : "ambassador";
  const t = partnerPageText[fd.get("lang") === "gu" ? "gu" : "en"].errors;
  const values = Object.fromEntries(FIELDS[kind].map((f) => [f, field(fd, f, 120)])) as Partial<Record<SignupField, string>>;
  const result = await callBackend<NonNullable<SignupState["data"]>>(`/olympiad/partners/${kind}/signup`, {
    // The sign-up page's language is kept, so later messages and the dashboard come in it.
    body: { ...values, consent: checked(fd, "consent"), lang: fd.get("lang") === "gu" ? "gu" : "en", ...antiSpam(fd) },
  });
  if (result.ok) return { status: "success", data: result.data };
  if (!result.fieldErrors) return { status: "error", message: result.message, values };
  // The API answers in English; field messages are shown in the page's language.
  const fieldErrors = Object.fromEntries(
    Object.entries(result.fieldErrors).map(([f, message]) => [
      f,
      f === "email" && message.includes("already used") ? t.emailTaken : (t[f as keyof typeof t] ?? t.check),
    ]),
  ) as Partial<Record<SignupField, string>>;
  return { status: "error", message: t.check, fieldErrors, values };
}

export type ResetState = FormState<"email", { sent: true }>;

/** "Forgot your password?": the API emails a fresh link if the email belongs to an approved partner. */
export async function requestPasswordReset(_prev: ResetState, fd: FormData): Promise<ResetState> {
  const kind: PartnerKind = fd.get("kind") === "school" ? "school" : "ambassador";
  const email = field(fd, "email", 120);
  const result = await callBackend<{ sent: true }>(`/olympiad/partners/${kind}/password-reset`, { body: { email } });
  if (result.ok) return { status: "success", data: result.data };
  const lang = await dashboardLanguage();
  return {
    status: "error",
    message: apiMessage(result.message, lang),
    fieldErrors: result.fieldErrors?.email ? { email: apiMessage(result.fieldErrors.email, lang) } : undefined,
    values: { email },
  };
}

export type PasswordState = FormState<"password" | "confirm", { kind: PartnerKind; email: string }>;

/** "Choose your password" from the one-time link in the approval or reset email. */
export async function setPartnerPassword(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const password = String(fd.get("password") ?? "").slice(0, 200);
  const confirm = String(fd.get("confirm") ?? "").slice(0, 200);
  if (password !== confirm) return { status: "error", fieldErrors: { confirm: "The two passwords are not the same." } };
  const result = await callBackend<{ kind: PartnerKind; email: string }>("/olympiad/partners/password", {
    body: { token: field(fd, "token", 512), password },
  });
  if (result.ok) return { status: "success", data: result.data };
  return {
    status: "error",
    message: result.fieldErrors ? undefined : result.message,
    fieldErrors: result.fieldErrors as PasswordState["fieldErrors"],
  };
}
