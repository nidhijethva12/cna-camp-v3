"use server";

import { cookies } from "next/headers";
import { DASHBOARD_LANG_COOKIE } from "@/lib/olympiad/dashboardLanguage";

/** The language switch on the School and Ambassador dashboards. */
export async function setDashboardLanguage(lang: string) {
  (await cookies()).set(DASHBOARD_LANG_COOKIE, lang === "gu" ? "gu" : "en", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
}
