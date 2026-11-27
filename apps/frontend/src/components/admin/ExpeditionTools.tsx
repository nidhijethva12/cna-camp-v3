"use client";

import { toast } from "@payloadcms/ui";
import Link from "next/link";
import { useState } from "react";

const BASE = "/api/expedition-registrations";

type Kind = "link" | "reminder";

const ASK: Record<Kind, string> = {
  link: "Send the Zoom link on WhatsApp to every paid person who has not got it yet?",
  reminder: "Send the meeting-day reminder on WhatsApp to every paid person?",
};

/** Above the Yatra registrations list: the CSV file, and the two "send to all" WhatsApp actions. */
export function ExpeditionTools() {
  const [busy, setBusy] = useState<Kind | null>(null);

  const sendAll = async (kind: Kind) => {
    if (!window.confirm(ASK[kind])) return;
    setBusy(kind);
    let sent = 0;
    let failed = 0;
    try {
      // The server works for a few seconds per call; this keeps calling until nobody is left.
      for (;;) {
        const res = await fetch(`${BASE}/send-all/${kind}`, { method: "POST", credentials: "include" });
        const data = (await res.json().catch(() => ({}))) as { sent?: number; failed?: number; left?: number; message?: string };
        if (!res.ok) {
          toast.error(data.message ?? "The messages could not be sent. Please try again.");
          break;
        }
        sent += data.sent ?? 0;
        failed += data.failed ?? 0;
        if (!data.left || !(data.sent || data.failed)) {
          if (failed) toast.warning(`Sent to ${sent}. ${failed} could not be sent: open those people to see the reason.`);
          else toast.success(sent ? `Sent to ${sent} ${sent === 1 ? "person" : "people"}.` : "Nobody is waiting for this message.");
          break;
        }
      }
    } catch {
      toast.error(`Could not reach the server. Sent to ${sent} so far; press again to continue.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="cna-export">
      <a
        href={`${BASE}/export`}
        download
        className="btn btn--style-secondary btn--size-small"
        onClick={(e) => {
          const filters = [...new URLSearchParams(window.location.search)].filter(([key]) => key.startsWith("where") || key === "search");
          e.currentTarget.href = filters.length ? `${BASE}/export?${new URLSearchParams(filters)}` : `${BASE}/export`;
        }}
      >
        Export to CSV
      </a>
      <button type="button" className="btn btn--style-secondary btn--size-small" disabled={busy !== null} onClick={() => sendAll("link")}>
        {busy === "link" ? "Sending…" : "Send the Zoom link to those who have not got it"}
      </button>
      <button
        type="button"
        className="btn btn--style-secondary btn--size-small"
        disabled={busy !== null}
        onClick={() => sendAll("reminder")}
      >
        {busy === "reminder" ? "Sending…" : "Send reminder to all"}
      </button>
      <span>
        The Zoom link is set in <Link href="/admin/globals/expedition-settings">Yatra settings</Link>. Messages go only to people who have
        paid.
      </span>
    </div>
  );
}
