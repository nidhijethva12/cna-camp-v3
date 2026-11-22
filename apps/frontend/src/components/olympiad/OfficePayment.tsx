"use client";

import { useState, useTransition, type ReactNode } from "react";
import { recordOfficePayment } from "@/actions/olympiad/office";
import { OFFICE_METHOD_LABELS, OFFICE_METHODS, type OfficeMethod } from "@/lib/olympiad/officePayments";

/**
 * After staff save a registration at the office: the fee to collect, and (for an Admin) the form
 * that records it. Recording the payment confirms the registration and shows the receipt.
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
  const [method, setMethod] = useState<OfficeMethod>("cash");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (receipt) return done(receipt);

  const record = () => {
    if (!window.confirm(`Record ₹${fee.toLocaleString("en-IN")} as received from ${name}? This confirms the registration.`)) return;
    setError("");
    start(async () => {
      const result = await recordOfficePayment({ id, method, reference });
      if (!result.ok) setError(result.message);
      else if (result.receiptToken) setReceipt(result.receiptToken);
      else setError("The payment is recorded. Open the person in the admin to see the registration number.");
    });
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-card bg-soft p-5">
        <p className="text-[14px] text-muted">Registration saved. Not confirmed until the fee is recorded.</p>
        <p className="font-display text-[20px] font-extrabold">{name}</p>
        <p className="mt-1 text-[15px]">
          Group {group} · Fee to collect <b className="font-display">₹{fee.toLocaleString("en-IN")}</b>
        </p>
      </div>
      {canRecordPayments ? (
        <>
          <fieldset className="grid gap-2">
            <legend className="text-[15px] font-bold">How was the fee paid?</legend>
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
          {error && (
            <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
              {error}
            </p>
          )}
          <button type="button" onClick={record} disabled={pending} className="btn btn-primary w-full">
            {pending ? "Recording…" : `Record ₹${fee.toLocaleString("en-IN")} as received`}
          </button>
        </>
      ) : (
        <p role="status" className="rounded-card border border-line p-4 text-[15px]">
          Collect the fee and ask an Admin to record it: Olympiad → Master list → open this person → “Record payment”.
        </p>
      )}
    </div>
  );
}
