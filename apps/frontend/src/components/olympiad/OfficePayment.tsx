"use client";

import { useState, useTransition, type ReactNode } from "react";
import { officeOnlineOrder, recordOfficePayment, type OfficeOrderResult } from "@/actions/olympiad/office";
import { OFFICE_METHOD_LABELS, OFFICE_METHODS, type OfficeMethod } from "@/lib/olympiad/officePayments";
import { PaymentStep } from "./PaymentStep";

type Online = Extract<OfficeOrderResult, { ok: true }>;

/**
 * After staff save a registration at the office: the fee, and how it is taken. Either online, with
 * Razorpay opening right here, or at the office (cash, UPI, bank transfer, cheque), which an Admin
 * records. Both confirm the registration and show the receipt.
 */
export function OfficePayment({
  id,
  name,
  group,
  fee,
  canRecordPayments,
  done,
}: {
  id: string;
  name: string;
  group: string;
  fee: number;
  canRecordPayments: boolean;
  /** The receipt screen, given the receipt link. */
  done: (receiptToken: string) => ReactNode;
}) {
  const [way, setWay] = useState<"online" | "office">("online");
  const [online, setOnline] = useState<Online | null>(null);
  const [method, setMethod] = useState<OfficeMethod>("cash");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const amount = `₹${fee.toLocaleString("en-IN")}`;

  if (receipt) return done(receipt);
  // Razorpay Checkout takes over from here; when it is paid, the receipt shows.
  if (online) return <PaymentStep summary={online} done={done} />;

  const payOnline = () => {
    setError("");
    start(async () => {
      const result = await officeOnlineOrder(id);
      if (!result.ok) setError(result.message);
      else if (!result.order)
        setError("Online payment is not available right now. Take the fee at the office, or try again in a few minutes.");
      else setOnline(result);
    });
  };

  const record = () => {
    if (!window.confirm(`Record ${amount} as received from ${name}? This confirms the registration.`)) return;
    setError("");
    start(async () => {
      const result = await recordOfficePayment({ id, method, reference });
      if (!result.ok) setError(result.message);
      else if (result.receiptToken) setReceipt(result.receiptToken);
      else setError("The payment is recorded. Open the person in the admin to see the registration number.");
    });
  };

  const choice = (value: "online" | "office", title: string, text: string) => (
    <label
      className={`flex cursor-pointer gap-3 rounded-card border-[1.5px] px-4 py-3.5 ${way === value ? "border-dark bg-soft" : "border-line"}`}
    >
      <input
        type="radio"
        name="way"
        value={value}
        checked={way === value}
        onChange={() => {
          setWay(value);
          setError("");
        }}
        className="mt-1 accent-primary"
      />
      <span>
        <b className="block font-display text-[16px]">{title}</b>
        <span className="text-[14px] text-muted">{text}</span>
      </span>
    </label>
  );

  return (
    <div className="grid gap-4">
      <div className="rounded-card bg-soft p-5">
        <p className="text-[14px] text-muted">Registration saved. Not confirmed until the fee is paid.</p>
        <p className="font-display text-[20px] font-extrabold">{name}</p>
        <p className="mt-1 text-[15px]">
          Group {group} · Fee <b className="font-display">{amount}</b>
        </p>
      </div>

      <fieldset className="grid gap-2.5">
        <legend className="mb-1 text-[15px] font-bold">How is the fee paid?</legend>
        {choice("online", "Pay online now", "Razorpay opens here: UPI, card, net banking or wallet.")}
        {choice("office", "Paid at the office", "Cash, UPI to the Trust, bank transfer or cheque. An Admin marks it as paid.")}
      </fieldset>

      {way === "office" && canRecordPayments && (
        <>
          <fieldset className="grid gap-2">
            <legend className="text-[15px] font-bold">Paid by</legend>
            <div className="grid grid-cols-2 gap-2">
              {OFFICE_METHODS.map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-card border-[1.5px] px-3.5 py-3 text-[15px] ${method === m ? "border-dark bg-soft font-bold" : "border-line"}`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                    className="accent-primary"
                  />
                  {OFFICE_METHOD_LABELS[m]}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5">
            <span className="text-[15px] font-bold">
              Reference <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              value={reference}
              maxLength={120}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Receipt book number, UPI or cheque number"
              className="field"
            />
          </label>
        </>
      )}
      {way === "office" && !canRecordPayments && (
        <p role="status" className="rounded-card border border-line p-4 text-[15px]">
          Collect the fee and ask an Admin to mark it as paid: Olympiad → Master list → open this person → payment box.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
          {error}
        </p>
      )}

      {way === "online" && (
        <button type="button" onClick={payOnline} disabled={pending} className="btn btn-primary w-full">
          {pending ? "Opening the payment…" : `Pay ${amount} online`}
        </button>
      )}
      {way === "office" && canRecordPayments && (
        <button type="button" onClick={record} disabled={pending} className="btn btn-primary w-full">
          {pending ? "Saving…" : `Mark ${amount} as paid`}
        </button>
      )}
    </div>
  );
}
