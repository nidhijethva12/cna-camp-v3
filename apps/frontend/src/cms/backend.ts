/**
 * Calls the Olympiad API (apps/backend) from admin hooks. Kept free of Next.js-only imports because
 * the Payload CLI loads collection files outside Next.js.
 */
export async function backendPost<T>(path: string, body: unknown): Promise<T> {
  const base = process.env.BACKEND_URL;
  const key = process.env.BACKEND_API_KEY;
  if (!base || !key) throw new Error("BACKEND_URL or BACKEND_API_KEY is not set");
  const res = await fetch(`${base.replace(/\/+$/, "")}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-key": key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Olympiad API ${path} answered ${res.status}`);
  return (await res.json()) as T;
}

/**
 * The same call, for an action a person waits on: the API's own message for a refused request
 * (already paid, not found) comes back instead of an exception, so the admin can show it.
 */
export async function backendAsk<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const base = process.env.BACKEND_URL;
  const key = process.env.BACKEND_API_KEY;
  const failed = "The Olympiad server could not be reached. Please try again in a minute.";
  if (!base || !key) return { ok: false, message: failed };
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json().catch(() => ({}))) as T & { message?: unknown };
    if (res.ok) return { ok: true, data };
    return { ok: false, message: res.status < 500 && typeof data.message === "string" ? data.message : failed };
  } catch {
    return { ok: false, message: failed };
  }
}
