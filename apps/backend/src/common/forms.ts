import { HttpException, HttpStatus } from '@nestjs/common';
import { waitUntil } from '@vercel/functions';

/** Field errors for a form, keyed by field name; the website shows them next to each field. */
export type FieldErrors = Record<string, string>;

/** 400 with field errors, 429 for rate limits: the website turns both into messages on the form. */
export class FormError extends HttpException {
  constructor(
    message: string,
    fieldErrors?: FieldErrors,
    status = HttpStatus.BAD_REQUEST,
  ) {
    super({ message, fieldErrors }, status);
  }
}

export const tooMany = (message: string) =>
  new FormError(message, undefined, HttpStatus.TOO_MANY_REQUESTS);

/** A trimmed, single-spaced, length-capped string from an untrusted request body. */
export const text = (value: unknown, max = 200) =>
  (typeof value === 'string' ? value : '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, max);

/** Free text (keeps line breaks), length-capped. */
export const longText = (value: unknown, max = 1000) =>
  (typeof value === 'string' ? value : '').trim().slice(0, max);

export function throwIfErrors(fieldErrors: FieldErrors) {
  if (Object.keys(fieldErrors).length)
    throw new FormError('Please check the highlighted fields.', fieldErrors);
}

/**
 * Work that runs after the response (messages), so a slow WhatsApp or mail server never delays a
 * form. On Vercel `waitUntil` keeps the function alive until it finishes; locally it simply runs.
 */
export function background(label: string, task: () => Promise<unknown>) {
  const run = task().catch((err) => console.error(`[${label}] failed`, err));
  try {
    waitUntil(run);
  } catch {
    // Not on Vercel: the promise already runs on its own.
  }
}
