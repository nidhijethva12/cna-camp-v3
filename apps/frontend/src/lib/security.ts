import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/**
 * Identifies the visitor for the enquiry form's rate limit without storing their IP: a keyed hash of
 * the address the host's proxy reports (on Vercel the first x-forwarded-for entry is the real client).
 */
export async function visitorKey() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  return ip
    ? createHmac("sha256", process.env.PAYLOAD_SECRET ?? "")
        .update(ip)
        .digest("hex")
        .slice(0, 32)
    : undefined;
}

export const since = (ms: number) => new Date(Date.now() - ms).toISOString();
