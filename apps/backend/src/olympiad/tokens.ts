import { createHmac } from 'node:crypto';
import { config } from '../config.js';
import { safeEqual } from '../common/security.js';

/**
 * Signed, expiring tokens for links sent to people (parent consent, unsubscribe, pay later) and for
 * dashboard sessions. Format: base64url(JSON payload) "." base64url(HMAC).
 */
export type TokenPurpose =
  'consent' | 'unsubscribe' | 'pay' | 'session' | 'password' | 'invite';

interface TokenBody {
  /** What the token is for; a token for one purpose is never accepted for another. */
  p: TokenPurpose;
  /** The document it points to. */
  id: string;
  /** Expiry, seconds since epoch. */
  exp: number;
  /** Extra claim, e.g. the dashboard kind. */
  k?: string;
  /** Version the token was made for; a "set password" link stops working once the password changes. */
  v?: string;
}

export const DAY = 24 * 60 * 60;

const sign = (data: string) =>
  createHmac('sha256', config.tokenSecret).update(data).digest('base64url');

export function createToken(
  purpose: TokenPurpose,
  id: string,
  ttlSeconds: number,
  kind?: string,
  version?: string,
) {
  const body: TokenBody = {
    p: purpose,
    id,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    ...(kind ? { k: kind } : {}),
    ...(version ? { v: version } : {}),
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  return `${data}.${sign(data)}`;
}

/** The token's document id and kind, or null if it is forged, expired or for another purpose. */
export function readToken(
  token: string | undefined | null,
  purpose: TokenPurpose,
) {
  if (!token || token.length > 512) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig || !safeEqual(sig, sign(data))) return null;
  try {
    const body = JSON.parse(
      Buffer.from(data, 'base64url').toString(),
    ) as TokenBody;
    if (
      body.p !== purpose ||
      typeof body.id !== 'string' ||
      body.exp < Date.now() / 1000
    )
      return null;
    return { id: body.id, kind: body.k, version: body.v };
  } catch {
    return null;
  }
}
