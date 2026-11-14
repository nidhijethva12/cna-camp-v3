import { NextResponse, type NextRequest } from "next/server";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";
import { getOlympiadConfig, registrationState } from "@/lib/olympiad/settings";

/** Remembered for the registration form when the visitor registers later; a typed code still wins. */
const REF_COOKIE = "olympiad_ref";
const REF_DAYS = 60;

/**
 * The link an Ambassador or School shares (cnacamp.com/olympiad/r/CNA-AMB-0007). The Olympiad API
 * counts the open; the visitor lands on the registration form while it is open, or on the Olympiad
 * page before that, with the code kept for later.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/olympiad/r/[code]">) {
  if (!olympiadApiLive) return NextResponse.redirect(new URL("/", request.url));
  const { code } = await params;
  const [opened, config] = await Promise.all([
    callBackend<{ kind: "school" | "ambassador" | null; code: string | null }>("/olympiad/links/open", { body: { code } }),
    getOlympiadConfig(),
  ]);
  const target = registrationState(config) === "open" ? "/olympiad/register" : "/olympiad";
  const response = NextResponse.redirect(new URL(target, request.url));
  if (opened.ok && opened.data.code) {
    response.cookies.set(REF_COOKIE, opened.data.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/olympiad",
      maxAge: REF_DAYS * 24 * 60 * 60,
    });
  }
  return response;
}
