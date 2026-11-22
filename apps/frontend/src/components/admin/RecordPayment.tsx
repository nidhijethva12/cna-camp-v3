"use client";

import { toast, useAuth, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";
import { OFFICE_METHOD_LABELS, OFFICE_METHODS, type OfficeMethod } from "@/lib/olympiad/officePayments";

/**
 * The payment box on a registration: the one place where the payment status is changed by hand, and
 * only by an Admin. A pending fee can be recorded as taken at the office (cash, UPI, bank transfer,
 * cheque), which confirms the registration as an online payment does. A fee recorded at the office
 * can be changed back to "not paid". A fee paid online can't be changed here: it is refunded in Razorpay.
 */
export function RecordPayment() {
  const { id } = useDocumentInfo();
  const { user } = useAuth();
  const person = useFormFields(([fields]) => ({
    type: fields.type?.value,
    status: fields.paymentStatus?.value,
    method: String(fields.paymentMethod?.value ?? ""),
    fee: Number(fields.fee?.value ?? 0),
    name: String(fields.name?.value ?? ""),
  }));
  const [method, setMethod] = useState<OfficeMethod>("cash");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);

  if (!id || person.type !== "registered" || person.fee <= 0 || person.status === "free") return null;
  const isAdmin = (user as { role?: string } | null)?.role === "admin";
  const amount = `₹${person.fee.toLocaleString("en-IN")}`;
  const paid = person.status === "paid";

  const send = async (action: "record-payment" | "undo-payment", body: object, done: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/olympiad-people/${id}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        toast.error(data.message ?? "The payment status could not be changed. Please try again.");
        return;
      }
      toast.success(done);
      // The saved person changed outside this form, so the page is loaded again with the new status.
      window.location.reload();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!paid) {
    if (!isAdmin) {
      return (
        <p className="cna-pay cna-pay--note">
          The fee of {amount} is not paid yet. If it was paid at the office, ask an Admin to record it here.
        </p>
      );
    }
    const record = () => {
      if (!window.confirm(`Record ${amount} as received from ${person.name}? This confirms the registration and sends the confirmation.`))
        return;
      void send("record-payment", { method, reference }, "Payment recorded. The registration is confirmed.");
    };
    return (
      <div className="cna-pay">
        <p className="cna-pay__title">Payment status: not paid</p>
        <p className="cna-pay__text">
          Record the fee of {amount} here only when you have received the money at the office. It gives the Registration ID and sends the
          confirmation.
        </p>
        <div className="cna-pay__row">
          <label>
            <span>Paid by</span>
            <select value={method} onChange={(e) => setMethod(e.target.value as OfficeMethod)} disabled={busy}>
              {OFFICE_METHODS.map((m) => (
                <option key={m} value={m}>
                  {OFFICE_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="cna-pay__ref">
            <span>Reference (optional)</span>
            <input
              value={reference}
              maxLength={120}
              disabled={busy}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Receipt book number, UPI or cheque number"
            />
          </label>
          <button type="button" className="btn btn--style-primary btn--size-medium" onClick={record} disabled={busy}>
            {busy ? "Saving…" : `Mark as paid (${amount})`}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;
  const office = OFFICE_METHODS.find((m) => m === person.method);
  if (!office) {
    return (
      <p className="cna-pay cna-pay--note">
        Payment status: paid online through Razorpay. It cannot be changed here; if the money must go back, refund it in Razorpay.
      </p>
    );
  }
  const undo = () => {
    if (
      !window.confirm(
        `Change ${person.name} back to "not paid"? Use this only if the ${amount} was not actually received. The Registration ID stays, but the receipt stops working until a payment is recorded again.`,
      )
    )
      return;
    void send("undo-payment", {}, "Changed back to not paid.");
  };
  return (
    <div className="cna-pay cna-pay--paid">
      <p className="cna-pay__title">Payment status: paid at the office ({OFFICE_METHOD_LABELS[office]})</p>
      <p className="cna-pay__text">
        Recorded by an Admin. If this was a mistake, or the money did not arrive (for example a returned cheque), change it back.
      </p>
      <button type="button" className="btn btn--style-secondary btn--size-medium" onClick={undo} disabled={busy}>
        {busy ? "Saving…" : "Change back to not paid"}
      </button>
    </div>
  );
}
