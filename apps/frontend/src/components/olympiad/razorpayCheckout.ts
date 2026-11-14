"use client";

import type { CheckoutOrder } from "@/actions/olympiad/register";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;
function loadScript() {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Razorpay Checkout failed to load"));
    };
    document.head.append(script);
  });
  return loading;
}

export interface CheckoutCallbacks {
  onPaid: (payment: { orderId: string; paymentId: string; signature: string }) => void;
  /** Payment failed, or the window was closed without paying. */
  onStopped: (message: string) => void;
}

/** What the visitor is told when the payment stops, in the page's language. */
export interface CheckoutMessages {
  windowFailed: string;
  windowClosed: string;
  payFailed: string;
}

const englishMessages: CheckoutMessages = {
  windowFailed: "The payment window couldn't load. Check your internet connection and try again.",
  windowClosed: "The payment window was closed before paying. Your form is saved; you can pay now.",
  payFailed: "The payment didn't go through. Please try again.",
};

/** Opens Razorpay Checkout for an order the Olympiad API created (the amount is fixed by the order). */
export async function openCheckout(
  order: NonNullable<CheckoutOrder>,
  details: { description: string; prefill: { name: string; email: string; contact: string } },
  { onPaid, onStopped }: CheckoutCallbacks,
  messages: CheckoutMessages = englishMessages,
) {
  try {
    await loadScript();
  } catch {
    onStopped(messages.windowFailed);
    return;
  }
  const checkout = new window.Razorpay!({
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: "INR",
    name: "Adventure Olympiad · CNA",
    description: details.description,
    image: `${window.location.origin}/img/logo.png`,
    prefill: { ...details.prefill, contact: details.prefill.contact.replace(/\s/g, "") },
    theme: { color: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() },
    handler: (r: RazorpaySuccess) =>
      onPaid({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
    modal: { ondismiss: () => onStopped(messages.windowClosed) },
  });
  // Razorpay's own reason is in English, so the page's message is shown instead.
  checkout.on("payment.failed", () => onStopped(messages.payFailed));
  checkout.open();
}
