"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payForStudents } from "@/actions/olympiad/school";
import { openCheckout } from "./razorpayCheckout";
import { waitForPayment } from "./waitForPayment";

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** "Pay ₹X for N pending students": one Razorpay payment for every student the school still owes for. */
export function SchoolPay({ count, amount }: { count: number; amount: number }) {
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
      setMessage({ tone: "error", text: "Online payment is being set up. Please try again in a few days, or contact the CNA team." });
      return;
    }
    const students = opened.count === 1 ? "1 student" : `${opened.count} students`;
    await openCheckout(
      opened.order,
      { description: `Adventure Olympiad 2.0 · ${students}`, prefill: opened.prefill },
      {
        onPaid: async (payment) => {
          const result = await waitForPayment(payment);
          setBusy(false);
          setMessage(
            !result.ok
              ? { tone: "error", text: result.message }
              : result.paid
                ? { tone: "ok", text: `Paid ${rupees(opened.amount)} for ${students}. Each one gets their confirmation.` }
                : { tone: "ok", text: "Payment received. Razorpay is confirming it; the students show as paid within a few minutes." },
          );
          router.refresh();
        },
        onStopped: (text) => {
          setBusy(false);
          setMessage({ tone: "error", text });
        },
      },
    );
  };

  return (
    <div className="grid justify-items-end gap-1.5">
      <button type="button" onClick={pay} disabled={busy} className="btn btn-primary">
        {busy ? "Opening the payment…" : `Pay ${rupees(amount)} for ${count} pending ${count === 1 ? "student" : "students"}`}
      </button>
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
