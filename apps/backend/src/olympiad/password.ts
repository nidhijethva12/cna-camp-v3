import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

const scrypt = (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCallback(password, salt, keylen, options, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );

/**
 * Checks a dashboard password against the hash the website's admin stored when CNA set it
 * ("scrypt$N$r$p$<salt>$<hash>", written by apps/frontend/src/lib/olympiad/password.ts).
 */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
) {
  const [scheme, n, r, p, salt, hash] = (stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(
    password,
    Buffer.from(salt, 'base64'),
    expected.length,
    { N: Number(n), r: Number(r), p: Number(p) },
  );
  return timingSafeEqual(key, expected);
}

/** A well-formed hash of a random password, checked when the email is unknown so both paths take as long. */
export const DUMMY_HASH = `scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$${'A'.repeat(86)}==`;

const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 10;

/** Same "scrypt$N$r$p$<salt>$<hash>" format the website's admin writes, so either side can check it. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, PARAMS);
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

/** Why a new partner password isn't acceptable, or null when it is. Same rule as the admin. */
export function passwordProblem(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (!/[a-z]/i.test(password) || !/\d/.test(password))
    return 'Use letters and numbers.';
  return null;
}
