import { confirmPayment, type PaymentConfirmation } from "@/actions/olympiad/register";

const EVERY_MS = 3000;
const FOR_MS = 90_000;

/**
 * After Razorpay Checkout reports success, asks the API until Razorpay's webhook has marked the order
 * paid. Gives up after a minute and a half; the payment still completes and the person is messaged.
 */
export async function waitForPayment(payment: { orderId: string; paymentId: string; signature: string }): Promise<PaymentConfirmation> {
  const until = Date.now() + FOR_MS;
  for (;;) {
    const result = await confirmPayment(payment);
    if (!result.ok || result.paid || Date.now() > until) return result;
    await new Promise((resolve) => setTimeout(resolve, EVERY_MS));
  }
}
