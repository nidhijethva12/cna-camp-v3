import { config } from '../config.js';
import { hmacHex, safeEqual } from '../common/security.js';

export const razorpayReady = () =>
  Boolean(config.razorpay.keyId && config.razorpay.keySecret);

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

/** Creates an order for `amountPaise`. The amount is always computed here from the settings, never sent by a browser. */
export async function createOrder(
  amountPaise: number,
  receipt: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  const auth = Buffer.from(
    `${config.razorpay.keyId}:${config.razorpay.keySecret}`,
  ).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: receipt.slice(0, 40),
      notes,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json()) as Partial<RazorpayOrder> & {
    error?: { description?: string };
  };
  if (!res.ok || !data.id)
    throw new Error(
      `Razorpay order failed: ${data.error?.description ?? res.status}`,
    );
  return data as RazorpayOrder;
}

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
