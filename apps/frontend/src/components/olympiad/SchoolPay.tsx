"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payForStudents } from "@/actions/olympiad/school";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { dashboardText } from "@/content/dashboards";
import { openCheckout } from "./razorpayCheckout";
import { waitForPayment } from "./waitForPayment";

/**
 * "Pay ₹X for N students": one Razorpay payment for every student the school still owes for. The
 * button stays switched off while any student is still missing a document, so the school pays once.
 */
export function SchoolPay({ count, amount, waiting, lang }: { count: number; amount: number; waiting: number; lang: OlympiadLang }) {
  const t = dashboardText[lang].pay;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const pay = async () => {
    setBusy(true);
    setMessage(null);
    const opened = await payForStudents();
    if (!opened.ok) {
      setBusy(false);
      setMessage({ tone: "error", text: opened.message });
      return;
    }
    if (!opened.order) {
      setBusy(false);
      setMessage({ tone: "error", text: t.notReady });
      return;
    }
    await openCheckout(
      opened.order,
      { description: t.description(opened.count), prefill: opened.prefill },
      {
        onPaid: async (payment) => {
          const result = await waitForPayment(payment);
          setBusy(false);
          setMessage(
            !result.ok
              ? { tone: "error", text: result.message }
              : { tone: "ok", text: result.paid ? t.paid(opened.amount, opened.count) : t.confirming },
          );
          router.refresh();
        },
        onStopped: (text) => {
          setBusy(false);
          setMessage({ tone: "error", text });
        },
      },
      t.checkout,
    );
  };

  return (
    <div className="grid justify-items-end gap-1.5">
      <button
        type="button"
        onClick={pay}
        disabled={busy || waiting > 0}
        className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? t.opening : t.button(amount, count)}
      </button>
      {waiting > 0 && <p className="max-w-[46ch] text-right text-[13.5px] text-muted">{t.waiting(waiting)}</p>}
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`max-w-[46ch] text-right text-[13.5px] ${message.tone === "ok" ? "text-success" : "text-primary"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
