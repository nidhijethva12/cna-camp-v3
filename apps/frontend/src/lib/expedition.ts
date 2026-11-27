import "server-only";
import { cache } from "react";
import { expeditionDefaults } from "@/content/expedition";
import { getCms } from "@/lib/payload";

export type ExpeditionPhase = "before" | "open" | "closed";

/** What the public page may know. The Zoom link is never part of it. */
export interface ExpeditionState {
  phase: ExpeditionPhase;
  opensAt: string;
  closesAt: string;
  fee: number;
  minAge: number;
}

const whole = (value: unknown, fallback: number) => (typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback);

/** The Yatra's dates and fee from the admin, with the phase decided on the server's clock. */
export const getExpeditionState = cache(async (): Promise<ExpeditionState> => {
  const payload = await getCms();
  const doc = await payload.findGlobal({ slug: "expedition-settings", depth: 0 });
  const opensAt = doc.opensAt ?? expeditionDefaults.opensAt;
  const closesAt = doc.closesAt ?? expeditionDefaults.closesAt;
  const mode = doc.registrationMode ?? "auto";
  const now = Date.now();
  const phase: ExpeditionPhase =
    mode === "open"
      ? "open"
      : mode === "closed"
        ? "closed"
        : now < Date.parse(opensAt)
          ? "before"
          : now > Date.parse(closesAt)
            ? "closed"
            : "open";
  return { phase, opensAt, closesAt, fee: whole(doc.fee, expeditionDefaults.fee), minAge: whole(doc.minAge, expeditionDefaults.minAge) };
});

const istLong = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });
const istShort = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
const istTime = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });

const time = (iso: string) => istTime.format(new Date(iso)).toUpperCase();

/** "29 November 2026, 6:06 PM", in India time. */
export const formatIstLong = (iso: string) => `${istLong.format(new Date(iso))}, ${time(iso)}`;
/** "29 Nov 2026, 6:06 PM", in India time. */
export const formatIstShort = (iso: string) => `${istShort.format(new Date(iso))}, ${time(iso)}`;
