import "server-only";
import { headers } from "next/headers";

export type BackendResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> };

const UNAVAILABLE = "We couldn't reach our server just now. Please try again in a minute.";

/** The visitor's IP as reported by the host's proxy (on Vercel the first x-forwarded-for entry is the real client). */
async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
}

/**
 * Calls the Olympiad API (apps/backend) from the server. The shared key never reaches the browser, and
 * the visitor's IP is passed on for rate limits and consent proof. Form errors come back as
 * `{ ok: false, message, fieldErrors }`, ready to show on the form.
 */
export async function callBackend<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; session?: string } = {},
): Promise<BackendResult<T>> {
  const base = process.env.BACKEND_URL;
  const key = process.env.BACKEND_API_KEY;
  if (!base || !key) {
    console.error("[olympiad] BACKEND_URL or BACKEND_API_KEY is not set");
    return { ok: false, status: 503, message: UNAVAILABLE };
  }
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": key,
        "x-client-ip": await clientIp(),
        ...(init.session ? { "x-session": init.session } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string | string[]; fieldErrors?: Record<string, string> };
    if (res.ok) return { ok: true, data: data as T };
    if (res.status >= 500) console.error(`[olympiad] backend ${path} answered ${res.status}`);
    const message = typeof data.message === "string" && res.status < 500 ? data.message : UNAVAILABLE;
    return { ok: false, status: res.status, message, fieldErrors: data.fieldErrors };
  } catch (err) {
    console.error(`[olympiad] backend ${path} failed`, err);
    return { ok: false, status: 503, message: UNAVAILABLE };
  }
}
