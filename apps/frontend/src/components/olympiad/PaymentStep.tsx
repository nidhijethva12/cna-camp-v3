"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { ArrowRight, Check } from "@/components/ui/icons";
import { registrationText, type RegistrationText } from "@/content/registration";
import { openCheckout } from "./razorpayCheckout";
import type { Receipt } from "./RegistrationDone";
import { waitForPayment } from "./waitForPayment";

export interface PaymentSummary {
  regId: string;
  name: string;
  group: string;
  fee: number;
  order: CheckoutOrder;
  prefill: { name: string; email: string; contact: string };
}

type Phase =
  | { step: "ready" }
  | { step: "paying" }
  | { step: "confirming" }
  | { step: "paid"; receipt: Receipt }
  | { step: "waiting" }
  | { step: "stopped"; message: string };

/**
 * Pays one saved registration with Razorpay. Checkout opens once on arrival; after it, the page waits
 * for Razorpay's webhook to mark the payment paid, then shows `done` (or a short confirmation).
 */
export function PaymentStep({
  summary,
  autoOpen = true,
  t = registrationText.en.payment,
  done,
}: {
  summary: PaymentSummary;
  autoOpen?: boolean;
  t?: RegistrationText["payment"];
  /** The screen once paid, given the receipt; without it a short confirmation shows. */
  done?: (receipt: Receipt) => ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>({ step: "ready" });
  const opened = useRef(false);
  const { order } = summary;

  const pay = () => {
    if (!order) return;
    setPhase({ step: "paying" });
    void openCheckout(
      order,
      { description: `Registration ${summary.regId} · Group ${summary.group}`, prefill: summary.prefill },
      {
        onPaid: async (payment) => {
          setPhase({ step: "confirming" });
          const result = await waitForPayment(payment);
          if (!result.ok) setPhase({ step: "stopped", message: t.confirmFailed });
          else if (!result.paid) setPhase({ step: "waiting" });
          else setPhase({ step: "paid", receipt: { paymentId: result.paymentId, paidAt: result.paidAt, amount: result.amount } });
        },
        onStopped: (message) => setPhase({ step: "stopped", message }),
      },
      t,
    );
  };

  useEffect(() => {
    if (autoOpen && order && !opened.current) {
      opened.current = true;
      pay();
    }
    // Opens once when the step first shows; `pay` only reads values fixed for this summary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase.step === "paid" && done) return done(phase.receipt);

  if (phase.step === "paid") {
    return (
      <div className="grid justify-items-center gap-3 text-center" role="status">
        <span className="flex h-15 w-15 items-center justify-center rounded-full bg-success/12 text-[30px] text-success">
          <Check />
        </span>
        <h2 className="text-[26px]">{t.paidTitle(summary.name.split(" ")[0])}</h2>
        <p className="max-w-[44ch] text-muted">{t.paidText(summary.regId, summary.group, summary.fee)}</p>
        <Link href="/olympiad#notices" className="btn btn-primary mt-2">
          {t.noticeBoard} <ArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-card bg-soft p-5">
        <p className="text-[14px] text-muted">{t.saved}</p>
        <p className="font-display text-[20px] font-extrabold">
          {summary.name} · {summary.regId}
        </p>
        <p className="mt-1 text-[15px]">
          {t.group(summary.group)} · {t.fee} <b className="font-display">₹{summary.fee.toLocaleString("en-IN")}</b>
        </p>
      </div>
      {phase.step === "waiting" ? (
        <p role="status" className="rounded-card border border-success/30 bg-success/10 p-4 text-[15px]">
          {t.waiting}
        </p>
      ) : order ? (
        <>
          {phase.step === "stopped" && (
            <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
              {phase.message}
            </p>
          )}
          <button
            type="button"
            onClick={pay}
            disabled={phase.step === "paying" || phase.step === "confirming"}
            className="btn btn-primary w-full"
          >
            {phase.step === "confirming" ? t.confirming : phase.step === "paying" ? t.opening : t.pay(summary.fee)}
            <ArrowRight />
          </button>
          <p className="text-center text-[13px] text-muted">{t.secure}</p>
        </>
      ) : (
        <p role="status" className="rounded-card border border-line p-4 text-[15px]">
          {t.notReady}
        </p>
      )}
    </div>
  );
}
