"use client";

import { useEffect, useRef, useState } from "react";
import { getReceipt } from "@/actions/olympiad/receipt";
import { CheckCircle, FileText } from "@/components/ui/icons";
import { registrationText, type RegLang } from "@/content/registration";
import { site } from "@/content/site";
import type { ReceiptData } from "@/lib/olympiad/receipt";

export type RulesLinks = { gu: string; en: string };

const absolute = (href: string) => (/^https?:/.test(href) ? href : `https://www.cnacamp.com${href}`);
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const istDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "";
const longDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

/** After registering: loads the receipt from the saved registration, then shows it with the PDF download. */
export function RegistrationDone({
  receiptToken,
  lang,
  phone,
  rules,
}: {
  receiptToken: string;
  lang: RegLang;
  phone?: string;
  rules?: RulesLinks;
}) {
  const t = registrationText[lang];
  const [receipt, setReceipt] = useState<ReceiptData | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    void getReceipt(receiptToken).then((r) => live && setReceipt(r));
    return () => {
      live = false;
    };
  }, [receiptToken]);

  if (receipt === undefined) {
    return (
      <p role="status" className="rounded-card border border-line bg-light px-6 py-10 text-center text-muted shadow-card">
        {t.done.loading}
      </p>
    );
  }
  if (!receipt) {
    return (
      <p role="status" className="rounded-card border border-line bg-light px-6 py-10 text-center text-muted shadow-card">
        {t.done.notReady}
      </p>
    );
  }
  return <ReceiptCard receipt={receipt} lang={lang} phone={phone} rules={rules} autoDownload />;
}

/** The Registration ID on screen and the receipt PDF to download, drawn from the saved registration. */
export function ReceiptCard({
  receipt: r,
  lang,
  phone,
  rules,
  autoDownload = false,
}: {
  receipt: ReceiptData;
  /** The Rules and Terms PDFs, linked in the footer. */
  rules?: RulesLinks;
  lang: RegLang;
  phone?: string;
  /** Downloads the PDF once on arrival, right after registering or paying. */
  autoDownload?: boolean;
}) {
  const t = registrationText[lang];
  const p = t.receipt;
  const sheet = useRef<HTMLDivElement>(null);
  const [making, setMaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);
  const paid = r.status === "paid";

  const download = async () => {
    if (!sheet.current) return;
    setMaking(true);
    setFailed(false);
    try {
      await document.fonts.ready;
      const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      // The browser draws the sheet, so Gujarati text comes out exactly as on screen.
      const jpeg = await toJpeg(sheet.current, { pixelRatio: 2, quality: 0.9, backgroundColor: "#ffffff" });
      // The page is a picture, so each link gets a clickable area laid over where it is drawn.
      const frame = sheet.current.getBoundingClientRect();
      const links = [...sheet.current.querySelectorAll("a")].map((a) => ({ url: a.href, box: a.getBoundingClientRect() }));
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
      const mm = w / frame.width;
      for (const { url, box } of links) {
        pdf.link((pageW - w) / 2 + (box.left - frame.left) * mm, (box.top - frame.top) * mm, box.width * mm, box.height * mm, { url });
      }
      pdf.save(`${r.regId}.pdf`);
    } catch (err) {
      console.error("[olympiad] making the receipt PDF failed", err);
      setFailed(true);
    } finally {
      setMaking(false);
    }
  };

  useEffect(() => {
    if (!autoDownload || started.current) return;
    started.current = true;
    void download();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when the receipt first shows
  }, [autoDownload]);

  const sections: { title: string; rows: (false | "" | [string, string])[] }[] = [
    {
      title: p.participant,
      rows: [
        [p.name, r.name],
        [p.group, r.group],
        r.participant && [p.registeredAs, p.participants[r.participant] ?? r.participant],
        r.dob && [p.dob, longDate(r.dob)],
        [p.mobile, r.mobile ? `+91 ${r.mobile.replace(/^\+91/, "")}` : ""],
        [p.whatsapp, `+91 ${r.whatsapp.replace(/^\+91/, "")}`],
        [p.email, r.email],
        r.ambassador === true && [p.ambassador, p.yes],
      ],
    },
    {
      title: p.school,
      rows: [
        r.institution && [p.institution, r.institution],
        r.stage && [p.std, r.stage],
        p.schoolTypes[r.schoolType] && [p.schoolType, p.schoolTypes[r.schoolType]],
        r.district && [p.district, [r.district, r.pin].filter(Boolean).join(" · ")],
      ],
    },
    {
      title: p.guardian,
      rows: r.guardian
        ? [[p.relations[r.guardian.relation] ?? p.guardian, `${r.guardian.name} · +91 ${r.guardian.phone.replace(/^\+91/, "")}`]]
        : [],
    },
    {
      title: p.quiz,
      rows: [
        r.quizLanguage && [p.quizLanguage, p.languages[r.quizLanguage] ?? r.quizLanguage],
        r.quizWindow && [p.quizWindow, t.step2.quizWindows[r.quizWindow] ?? r.quizWindow],
        r.quizDate && [p.quizSlot, `${r.quizDate} · ${r.quizTime}`],
      ],
    },
  ];

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
        {r.regId}
      </p>
      <p className="max-w-[46ch] text-muted">{t.done.keepId}</p>
      <button type="button" onClick={download} disabled={making} className="btn btn-primary mt-1">
        <FileText /> {making ? t.done.pdfMaking : t.done.pdf}
      </button>
      <p className="max-w-[46ch] text-[13.5px] text-muted">{t.done.pdfHelp(paid)}</p>
      {autoDownload && <p className="max-w-[46ch] text-[13.5px] text-muted">{t.done.pdfAuto}</p>}
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
        <div ref={sheet} lang={lang} className="w-[794px] bg-light px-12 py-10 text-left text-[14px] text-dark">
          <div className="flex items-center gap-4 border-b-2 border-primary pb-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- drawn into the PDF, not shown on the page */}
            <img src="/img/logo.png" alt="" width={64} height={64} className="h-16 w-16 rounded-full" />
            <div className="min-w-0 flex-1 text-center">
              <p className="font-display text-[17px] font-extrabold">Climber Nature Adventure Club (CNA)</p>
              <p className="text-[12px] text-muted">
                {site.trust.name}, Rajkot · Reg. {site.trust.registration}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- drawn into the PDF, not shown on the page */}
            <img src="/img/sect-logo.webp" alt="" width={64} height={64} className="h-16 w-16 object-contain" />
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="font-display text-[13px] font-bold tracking-[0.12em] text-primary uppercase">Adventure Olympiad 2.0</p>
            <p className="font-display text-[13px] font-bold tracking-[0.12em] text-primary uppercase">
              {paid ? p.titlePaid : p.titleFree}
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between gap-6 rounded-card bg-soft px-5 py-4">
            <div>
              <p className="text-[12px] text-muted">{p.regId}</p>
              <p className="font-display text-[28px] font-extrabold tracking-[0.03em]">{r.regId}</p>
              {paid && r.razorpayPaymentId && (
                <p className="mt-1 text-[12px] text-muted">
                  {p.paymentId}: <span className="font-semibold text-dark">{r.razorpayPaymentId}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted">{p.issued}</p>
              <p className="font-semibold">{istDateTime(r.paidAt ?? r.registeredAt)}</p>
              <p className="mt-1 inline-block rounded-full bg-success/12 px-3 py-0.5 font-display text-[13px] font-bold text-success">
                {paid ? p.paid(rupees(r.fee)) : p.free}
              </p>
            </div>
          </div>

          {sections.map((sec) => {
            const rows = sec.rows.filter((row): row is [string, string] => Boolean(row));
            return rows.length ? (
              <div key={sec.title} className="mt-5">
                <p className="font-display text-[15px] font-extrabold">{sec.title}</p>
                <dl className="mt-1.5 border-t border-line">
                  {rows.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[190px_1fr] gap-3 border-b border-line py-1.75">
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-medium [overflow-wrap:anywhere]">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null;
          })}

          {paid && (
            <div className="mt-6 rounded-card border-2 border-success/40 px-5 py-4">
              <p className="font-display text-[15px] font-extrabold">{p.payment}</p>
              <dl className="mt-1.5">
                {[
                  [p.amount, rupees(r.fee)],
                  [p.method, p.online],
                  [p.paymentId, r.razorpayPaymentId],
                  [p.orderId, r.razorpayOrderId],
                  [p.paidOn, istDateTime(r.paidAt)],
                  [p.paidTo, `${site.trust.name}, Rajkot`],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[190px_1fr] gap-3 py-1">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium [overflow-wrap:anywhere]">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6 border-t border-line pt-3 text-[12px] text-muted">
            <p>{p.note(r.rulesVersion)}</p>
            {rules && (
              <p className="mt-1">
                {p.rulesLinks}{" "}
                <a href={absolute(rules.gu)} className="font-semibold text-dark underline">
                  {t.step5.rulesGu}
                </a>
                {" / "}
                <a href={absolute(rules.en)} className="font-semibold text-dark underline">
                  {t.step5.rulesEn}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
