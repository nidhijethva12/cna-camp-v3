"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

const LINKS = [
  { kind: "aadhaarCard", label: "Open Aadhaar card" },
  { kind: "schoolIdCard", label: "Open School ID card" },
] as const;

/** The Documents tab of a person: photo, document links and the Aadhaar number on request. */
export function OlympiadDocuments() {
  const { id } = useDocumentInfo();
  const documents = useFormFields(([fields]) => ({
    photo: Boolean(fields["documents.photo"]?.value),
    aadhaarCard: Boolean(fields["documents.aadhaarCard"]?.value),
    schoolIdCard: Boolean(fields["documents.schoolIdCard"]?.value),
  }));
  const last4 = useFormFields(([fields]) => String(fields.aadhaarLast4?.value ?? ""));
  const [aadhaar, setAadhaar] = useState("");
  const [error, setError] = useState("");

  if (!id) return null;
  const base = `/api/olympiad-people/${id}`;
  if (!documents.photo && !documents.aadhaarCard && !last4) {
    return <p className="cna-docs__empty">No documents: this person has not registered through the form.</p>;
  }

  const show = async () => {
    setError("");
    const res = await fetch(`${base}/aadhaar`, { credentials: "include", cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { aadhaar?: string };
    if (res.ok && data.aadhaar) setAadhaar(data.aadhaar);
    else setError("Could not show the number.");
  };

  return (
    <div className="cna-docs">
      {documents.photo && (
        // eslint-disable-next-line @next/next/no-img-element -- private, uncached admin file
        <img className="cna-docs__photo" src={`${base}/document/photo`} alt="Participant photo" />
      )}
      <div className="cna-docs__side">
        <p className="cna-docs__label">Aadhaar number</p>
        <p className="cna-docs__aadhaar">
          {aadhaar || (last4 ? `XXXX XXXX ${last4}` : "Not given")}
          {last4 && !aadhaar && (
            <button type="button" className="btn btn--style-secondary btn--size-small" onClick={show}>
              Show
            </button>
          )}
        </p>
        {error && <p className="cna-docs__error">{error}</p>}
        <div className="cna-docs__links">
          {LINKS.filter((l) => documents[l.kind]).map((l) => (
            <a
              key={l.kind}
              href={`${base}/document/${l.kind}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn--style-secondary btn--size-small"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
