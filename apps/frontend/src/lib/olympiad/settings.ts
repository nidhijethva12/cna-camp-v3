import "server-only";
import { cache } from "react";
import { getCms } from "@/lib/payload";
import { olympiadApiLive } from "./index";
import { DEFAULT_FEES, type Fees, type GroupId, type QuizSlot } from "./rules";

export type RegistrationState = "soon" | "open" | "closed";

export interface OlympiadConfig {
  mode: "auto" | "open" | "closed";
  opensAt: string;
  closesAt: string;
  feeLastDate: string;
  fees: Fees;
  consentText: string;
  consentVersion: string;
  milestones: { paid: number; reward: string }[];
  quizSlots: QuizSlot[];
}

const FALLBACK = {
  opensAt: "2026-11-14T18:30:00.000Z",
  closesAt: "2026-12-14T18:29:00.000Z",
  feeLastDate: "2026-12-31T18:29:00.000Z",
  consentText: "I agree to get Olympiad updates from CNA on WhatsApp and email. I can stop them any time.",
  consentVersion: "2026-10",
};

/** Olympiad settings from the admin; an unsaved global falls back to the published dates and fees. */
export const getOlympiadConfig = cache(async (): Promise<OlympiadConfig> => {
  const payload = await getCms();
  const doc = await payload.findGlobal({ slug: "olympiad-settings", depth: 0 });
  // Group 0's fee lives in the "G0" field: a field named "0" would read as a list position.
  const stored = (doc.fees ?? {}) as Record<string, { govt?: number | null; other?: number | null } | undefined>;
  const fee = (g: GroupId) => {
    const set = stored[g === "0" ? "G0" : g];
    const other = set?.other ?? DEFAULT_FEES[g].other;
    return { govt: g === "B" ? (set?.govt ?? DEFAULT_FEES.B.govt) : other, other };
  };
  return {
    mode: doc.registrationMode ?? "auto",
    opensAt: doc.opensAt ?? FALLBACK.opensAt,
    closesAt: doc.closesAt ?? FALLBACK.closesAt,
    feeLastDate: doc.feeLastDate ?? FALLBACK.feeLastDate,
    fees: { "0": fee("0"), A: fee("A"), B: fee("B"), C: fee("C"), D: fee("D"), E: fee("E") },
    consentText: doc.consentText || FALLBACK.consentText,
    consentVersion: doc.consentVersion || FALLBACK.consentVersion,
    milestones: (doc.milestones ?? []).map(({ paid, reward }) => ({ paid, reward })).sort((a, b) => a.paid - b.paid),
    quizSlots: (doc.quizSlots ?? [])
      .map((s) => ({ date: s.date, times: (s.times ?? []).map((t) => t.time) }))
      .filter((s) => s.times.length),
  };
});

export function registrationState(config: OlympiadConfig, now = new Date()): RegistrationState {
  if (config.mode === "open") return "open";
  if (config.mode === "closed") return Date.parse(config.opensAt) > now.getTime() ? "soon" : "closed";
  if (now.getTime() < Date.parse(config.opensAt)) return "soon";
  return now.getTime() > Date.parse(config.closesAt) ? "closed" : "open";
}

const istDate = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
const istTime = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });

/** "2026-11-14T18:30:00Z" → "15 Nov 2026", in India time. */
export const formatIstDate = (iso: string) => istDate.format(new Date(iso));
export const formatIstTime = (iso: string) => istTime.format(new Date(iso)).toUpperCase();

/** What the Olympiad page offers right now: the contact form until the API is connected, then the registration state. */
export async function getOlympiadPhase() {
  const config = await getOlympiadConfig();
  return {
    phase: olympiadApiLive ? registrationState(config) : ("contact" as const),
    closesOn: formatIstDate(config.closesAt),
    consentText: config.consentText,
  };
}
