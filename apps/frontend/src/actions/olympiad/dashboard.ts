"use server";

import { redirect } from "next/navigation";
import { apiMessage, dashboardText } from "@/content/dashboards";
import { callBackend } from "@/lib/olympiad/backend";
import { dashboardLanguage } from "@/lib/olympiad/dashboardLanguage";
import { field, type FormState } from "@/lib/olympiad/forms";
import { endSession, startSession, type PartnerKind } from "@/lib/olympiad/session";

export type LoginField = "email" | "password";
export type LoginState = FormState<LoginField>;

const DASHBOARD: Record<PartnerKind, string> = { school: "/school-dashboard", ambassador: "/ambassador-dashboard" };

const kindOf = (value: string): PartnerKind | null => (value === "school" || value === "ambassador" ? value : null);

/** Email and password login for the School and Ambassador dashboards, checked by the Olympiad API. */
export async function loginToDashboard(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const kind = kindOf(field(fd, "kind", 20));
  const email = field(fd, "email", 120);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  const lang = await dashboardLanguage();
  const t = dashboardText[lang].login;
  if (!kind) return { status: "error", message: t.reload };

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!email) fieldErrors.email = t.needEmail;
  if (!password) fieldErrors.password = t.needPassword;
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values: { email } };

  const result = await callBackend<{ token: string; maxAge: number }>(`/olympiad/partners/${kind}/login`, { body: { email, password } });
  if (!result.ok) return { status: "error", message: apiMessage(result.message, lang), values: { email } };
  await startSession(result.data.token, result.data.maxAge);
  redirect(DASHBOARD[kind]);
}

export async function logoutFromDashboard(fd: FormData) {
  await endSession();
  redirect(DASHBOARD[kindOf(field(fd, "kind", 20)) ?? "ambassador"]);
}
