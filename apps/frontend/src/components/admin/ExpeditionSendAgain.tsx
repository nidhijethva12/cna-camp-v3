"use client";

import { toast, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/** On a Yatra registration: sends the Zoom link to this person's WhatsApp again. Only for a paid registration. */
export function ExpeditionSendAgain() {
  const { id } = useDocumentInfo();
  const person = useFormFields(([fields]) => ({ status: fields.status?.value, whatsapp: String(fields.whatsapp?.value ?? "") }));
  const [busy, setBusy] = useState(false);

  if (!id) return null;
  if (person.status !== "paid") {
    return <p className="cna-pay cna-pay--note">The fee is not paid, so this person has not been sent the Zoom link.</p>;
  }

  const send = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/expedition-registrations/${id}/send-again`, { method: "POST", credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        toast.error(data.message ?? "The message could not be sent. Please try again.");
        return;
      }
      toast.success(`Sent to ${person.whatsapp}.`);
      window.location.reload();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cna-pay">
      <p className="cna-pay__title">Zoom link</p>
      <p className="cna-pay__text">Sends the registration confirmation with the Zoom link to this person&apos;s WhatsApp number again.</p>
      <div className="cna-pay__row">
        <button type="button" className="btn btn--style-primary btn--size-medium" onClick={send} disabled={busy}>
          {busy ? "Sending…" : "Send again"}
        </button>
      </div>
    </div>
  );
}
