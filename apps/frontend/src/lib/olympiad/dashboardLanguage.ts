import "server-only";
import { cookies } from "next/headers";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";

/** Remembers the language a School or an Ambassador picked for their dashboard. */
export const DASHBOARD_LANG_COOKIE = "olympiad_lang";

const asLang = (value: unknown): OlympiadLang | null => (value === "gu" || value === "en" ? value : null);

/**
 * The dashboard's language: what the person picked, else the language they signed up in (`saved`),
 * else English.
 */
export async function dashboardLanguage(saved?: string | null): Promise<OlympiadLang> {
  return asLang((await cookies()).get(DASHBOARD_LANG_COOKIE)?.value) ?? asLang(saved) ?? "en";
}
