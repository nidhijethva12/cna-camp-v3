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
