import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { config } from '../config.js';
import { hmacHex, safeEqual } from '../common/security.js';

export const razorpayReady = () =>
  Boolean(config.razorpay.keyId && config.razorpay.keySecret);

/** Razorpay refuses orders under ₹1. */
export const MIN_AMOUNT_PAISE = 100;

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

/** The fields of a Razorpay payment this API reads. */
export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
}

const UNAVAILABLE =
  "Online payment isn't available right now. Please try again in a few minutes or contact the CNA team.";

/**
 * One call to Razorpay's REST API with the key pair (Basic auth). A rejected key pair is a 401 with
 * a clear log line; any other Razorpay failure is a 500. The secret never leaves this server.
 */
async function razorpay<T>(path: string, body?: object): Promise<T> {
  const method = body ? 'POST' : 'GET';
  const auth = Buffer.from(
    `${config.razorpay.keyId}:${config.razorpay.keySecret}`,
  ).toString('base64');
  let res: Response;
  try {
    const headers = { Authorization: `Basic ${auth}` };
    const signal = AbortSignal.timeout(10_000);
    res = await fetch(
      `https://api.razorpay.com/v1${path}`,
      body
        ? {
            method,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
          }
        : { headers, signal },
    );
  } catch (err) {
    console.error(`[razorpay] ${method} ${path} did not answer`, err);
    throw new InternalServerErrorException(UNAVAILABLE);
  }
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: { description?: string };
  };
  if (res.status === 401) {
    console.error(
      '[razorpay] the API key pair was rejected: check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
    );
    throw new HttpException(UNAVAILABLE, HttpStatus.UNAUTHORIZED);
  }
  if (!res.ok) {
    console.error(
      `[razorpay] ${method} ${path} failed (${res.status}): ${data.error?.description ?? 'no reason given'}`,
    );
    throw new InternalServerErrorException(UNAVAILABLE);
  }
  return data;
}

/** Creates an order for `amountPaise`. The amount is always computed here from the settings, never sent by a browser. */
export async function createOrder(
  amountPaise: number,
  receipt: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  if (!Number.isInteger(amountPaise) || amountPaise < MIN_AMOUNT_PAISE)
    throw new BadRequestException('The amount to pay must be at least ₹1.');
  const order = await razorpay<Partial<RazorpayOrder>>('/orders', {
    amount: amountPaise,
    currency: 'INR',
    receipt: receipt.slice(0, 40),
    notes,
  });
  if (!order.id) {
    console.error('[razorpay] order created without an id', order);
    throw new InternalServerErrorException(UNAVAILABLE);
  }
  return order as RazorpayOrder;
}

/** The payment as Razorpay has it now. */
export const fetchPayment = (paymentId: string) =>
  razorpay<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);

/** Captures an authorized payment (only needed when the account doesn't capture automatically). */
export const capturePayment = (paymentId: string, amountPaise: number) =>
  razorpay<RazorpayPayment>(
    `/payments/${encodeURIComponent(paymentId)}/capture`,
    { amount: amountPaise, currency: 'INR' },
  );

/** Checks the signature Razorpay Checkout returns to the browser after a payment. */
export function checkoutSignatureValid(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const secret = config.razorpay.keySecret;
  return (
    Boolean(secret && signature) &&
    safeEqual(hmacHex(secret!, `${orderId}|${paymentId}`), signature)
  );
}

/** Checks the X-Razorpay-Signature header of a webhook against the raw request body. */
export function webhookSignatureValid(
  rawBody: Buffer | undefined,
  signature: string | undefined,
) {
  const secret = config.razorpay.webhookSecret;
  return (
    Boolean(secret && signature && rawBody) &&
    safeEqual(hmacHex(secret!, rawBody!.toString('utf8')), signature!)
  );
}
