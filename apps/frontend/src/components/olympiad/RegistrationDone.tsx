"use client";

import { useRef, useState } from "react";
import { CheckCircle, FileText } from "@/components/ui/icons";
import type { RegistrationText } from "@/content/registration";
import { RULES_VERSION } from "@/lib/olympiad/rules";

export type SummarySection = { title: string; rows: [string, string][] };

/** What Razorpay confirmed, printed as the receipt part of the PDF. */
export type Receipt = { paymentId: string; paidAt: string | null; amount: number };

const TRUST = "Saurashtra Education & Charitable Trust, Rajkot";
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const istDateTime = (iso: string | null) =>
  new Date(iso ?? Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

/** The screen after registering: the Registration ID and a PDF of every detail, with the receipt when a fee was paid. */
export function RegistrationDone({
  regId,
  name,
  group,
  fee,
  sections,
  receipt,
  phone,
  t,
}: {
  regId: string;
  name: string;
  group: string;
  fee: number;
  sections: SummarySection[];
  receipt: Receipt | null;
  phone?: string;
  t: RegistrationText;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const p = t.done.sheet;
  const [making, setMaking] = useState(false);
  const [failed, setFailed] = useState(false);

  const download = async () => {
    if (!sheet.current) return;
    setMaking(true);
    setFailed(false);
    try {
      const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      // The browser draws the sheet, so Gujarati text comes out exactly as on screen.
      const jpeg = await toJpeg(sheet.current, { pixelRatio: 2, quality: 0.9, backgroundColor: "#ffffff" });
      const image = new Image();
      image.src = jpeg;
      await image.decode();
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // One page: a long sheet is scaled down to fit rather than cut through a row.
      const scale = Math.min(pageW / image.width, pageH / image.height);
      const w = image.width * scale;
      pdf.addImage(jpeg, "JPEG", (pageW - w) / 2, 0, w, image.height * scale);
      pdf.save(`${regId}.pdf`);
    } catch (err) {
      console.error("[olympiad] making the registration PDF failed", err);
      setFailed(true);
    } finally {
      setMaking(false);
    }
  };

  return (
    <div
      className="grid justify-items-center gap-4 rounded-card border border-line bg-light px-6 py-10 text-center shadow-card"
      role="status"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-[32px] text-success">
        <CheckCircle />
      </span>
      <h2 className="font-display text-[26px] font-extrabold">{t.done.title}</h2>
      <p className="text-[13px] text-muted">{t.done.idLabel}</p>
      <p className="rounded-card border border-dashed border-line bg-soft px-5 py-3 font-display text-[26px] font-extrabold tracking-[0.04em]">
        {regId}
      </p>
      <p className="max-w-[46ch] text-muted">
        {t.done.textBefore}
        <b className="text-success">WhatsApp</b>
        {t.done.textAfter}
      </p>
      <button type="button" onClick={download} disabled={making} className="btn btn-primary mt-1">
        <FileText /> {making ? t.done.pdfMaking : t.done.pdf}
      </button>
      <p className="max-w-[46ch] text-[13.5px] text-muted">{t.done.pdfHelp(Boolean(receipt))}</p>
      {failed && (
        <p role="alert" className="text-[14px] text-danger">
          {t.errors.tryAgain}
        </p>
      )}
      {phone && (
        <p className="text-[14px] text-muted">
          {t.done.help} <b className="text-dark select-all">{phone}</b>
        </p>
      )}

      {/* The PDF page, drawn off screen at A4 width. */}
      <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[10000px]">
        <div ref={sheet} className="w-[794px] bg-light px-12 py-11 text-left text-[14px] text-dark">
          <div className="flex items-end justify-between gap-6 border-b-2 border-primary pb-4">
            <div>
              <p className="font-display text-[12px] font-bold tracking-[0.12em] text-primary uppercase">Adventure Olympiad 2.0</p>
              <p className="mt-1 font-display text-[24px] font-extrabold">{p.title}</p>
              <p className="text-[12.5px] text-muted">Climber Nature Adventure Club · {TRUST}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted">{p.regId}</p>
              <p className="font-display text-[24px] font-extrabold">{regId}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              [p.name, name],
              [p.group, group],
              [p.fee, fee === 0 ? t.common.free : rupees(fee)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-card bg-soft px-4 py-3">
                <p className="text-[12px] text-muted">{k}</p>
                <p className="font-display text-[16px] font-bold">{v}</p>
              </div>
            ))}
          </div>
          {sections.map((sec) => (
            <div key={sec.title} className="mt-5">
              <p className="font-display text-[15px] font-extrabold">{sec.title}</p>
              <dl className="mt-1.5 border-t border-line">
                {sec.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[200px_1fr] gap-3 border-b border-line py-1.75">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium [overflow-wrap:anywhere]">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {receipt && (
            <div className="mt-6 rounded-card border-2 border-success/40 px-5 py-4">
              <p className="font-display text-[15px] font-extrabold">{p.receipt}</p>
              <dl className="mt-1.5">
                {[
                  [p.amount, rupees(receipt.amount)],
                  [p.paidTo, TRUST],
                  [p.paymentId, receipt.paymentId],
                  [p.paidOn, istDateTime(receipt.paidAt)],
                  [p.for, `${regId} · ${p.group} ${group}`],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[200px_1fr] gap-3 py-1">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <p className="mt-6 text-[12px] text-muted">{p.footer(RULES_VERSION, istDateTime(null))}</p>
        </div>
      </div>
    </div>
  );
}
