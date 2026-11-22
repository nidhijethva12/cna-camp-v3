import "server-only";
import { cookies } from "next/headers";
import type { SheetStudent } from "@/components/olympiad/StudentSheet";
import { callBackend } from "./backend";

export type PartnerKind = "school" | "ambassador";

/** Holds the session token the Olympiad API signs at login; the API re-checks it on every request. */
const COOKIE = "olympiad_session";

export async function startSession(token: string, maxAge: number) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, so the dashboard link in the approval email and WhatsApp opens signed in.
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** The signed-in partner's session token, for calls the dashboard makes. */
export async function sessionToken() {
  return (await cookies()).get(COOKIE)?.value;
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/" });
}

/** The partner's dashboard data, or null when nobody is signed in (or the account was blocked). */
export async function dashboardData<T>(kind: PartnerKind) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const result = await callBackend<T>(`/olympiad/partners/${kind}/me`, { session: token });
  return result.ok ? result.data : null;
}

/** What the Olympiad API returns for each dashboard (dates arrive as ISO strings). */
export interface AmbassadorDashboard {
  name: string;
  role: string | null;
  city: string | null;
  approvedAt: string | null;
  code: string;
  shareUrl: string;
  stats: { clicks: number; registered: number; paid: number };
  /** Each reward and what it needs: `metric` says whether `paid` counts link opens or confirmed registrations. */
  milestones: { metric: "clicks" | "paid"; paid: number; reward: string; rewardGu?: string }[];
  /** The language they signed up in; the dashboard opens in it until they pick another. */
  language?: string;
}

export interface SchoolDashboard {
  name: string;
  code: string;
  type: string;
  district: string;
  coordinator: string;
  /** The language the school signed up in; the dashboard opens in it until they pick another. */
  language?: string;
  /** `students` counts complete registrations; `documentsPending` counts sheet rows still missing a document. */
  stats: { students: number; paid: number; pending: number; documentsPending: number };
  /** Students the school can pay for now, and their total fee in rupees. */
  pay: { count: number; amount: number };
  classLink: string;
  /** Every student from the school's sheet, complete or not. */
  sheet: SheetStudent[];
  students: {
    id: string;
    regId: string;
    name: string;
    stage: string;
    group: string;
    fee: number | null;
    paymentStatus: "free" | "pending" | "paid" | "failed";
    parentConsent: boolean;
  }[];
}
