"use server";

import { redirect } from "next/navigation";
import { callBackend } from "@/lib/olympiad/backend";
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
  if (!kind) return { status: "error", message: "Please reload the page and try again." };

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Enter the email the CNA team registered for you.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values: { email } };

  const result = await callBackend<{ token: string; maxAge: number }>(`/olympiad/partners/${kind}/login`, { body: { email, password } });
  if (!result.ok) return { status: "error", message: result.message, values: { email } };
  await startSession(result.data.token, result.data.maxAge);
  redirect(DASHBOARD[kind]);
}

export async function logoutFromDashboard(fd: FormData) {
  await endSession();
  redirect(DASHBOARD[kindOf(field(fd, "kind", 20)) ?? "ambassador"]);
}
