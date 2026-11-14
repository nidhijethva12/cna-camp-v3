import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

/** Constant-time comparison of two strings. */
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const hmacHex = (secret: string, data: string) =>
  createHmac('sha256', secret).update(data).digest('hex');

/**
 * A keyed hash of the visitor's IP: enough to rate-limit and to prove consent came from the same
 * device, without ever storing the IP itself (DPDP Act).
 */
export const ipHash = (ip: string | undefined) =>
  ip ? hmacHex(config.ipHashSecret, ip).slice(0, 32) : undefined;

/**
 * Cloudflare Turnstile check for the public forms. Until the secret is configured the check is
 * skipped, so forms keep working locally; the per-visitor rate limits still apply.
 */
export async function passesTurnstile(
  token: string | undefined,
  ip: string | undefined,
) {
  if (!config.turnstileSecret) return true;
  if (!token) return false;
  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: config.turnstileSecret,
          response: token,
          remoteip: ip ?? '',
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[turnstile] verification failed', err);
    return false;
  }
}

export const since = (ms: number) => new Date(Date.now() - ms);
