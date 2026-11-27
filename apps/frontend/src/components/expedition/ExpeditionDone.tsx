"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { getExpeditionReceipt, resendExpeditionLink, type ExpeditionReceipt } from "@/actions/expedition";
import { CheckCircle, FileText } from "@/components/ui/icons";
import { expedition } from "@/content/expedition";
import { site } from "@/content/site";

const istDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "";
const phone = (whatsapp: string) => `+91 ${whatsapp.replace(/^\+91/, "")}`;
const GENDERS: Record<string, string> = Object.fromEntries(expedition.form.genders);

/** After payment: the registration ID, the meeting time, the Zoom link once it is set, and the receipt PDF. */
export function ExpeditionDone({ receiptToken, payee }: { receiptToken: string; payee: string }) {
  const [receipt, setReceipt] = useState<ExpeditionReceipt | null | undefined>(undefined);
  const sheet = useRef<HTMLDivElement>(null);
  const [making, setMaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [resent, setResent] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    let live = true;
    void getExpeditionReceipt(receiptToken).then((r) => live && setReceipt(r));
    return () => {
      live = false;
    };
  }, [receiptToken]);

  if (receipt === undefined) {
    return (
      <p role="status" className="rounded-card border border-line bg-light px-6 py-10 text-center text-muted shadow-card">
        Loading your registration…
      </p>
    );
  }
  if (!receipt) {
    return (
      <p role="status" className="rounded-card border border-line bg-light px-6 py-10 text-center text-muted shadow-card">
        Your registration is being confirmed. The Zoom link will come on your WhatsApp number.
      </p>
    );
  }
  const r = receipt;

  const download = async () => {
    if (!sheet.current) return;
    setMaking(true);
    setFailed(false);
    try {
      await document.fonts.ready;
      const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const jpeg = await toJpeg(sheet.current, { pixelRatio: 2, quality: 0.9, backgroundColor: "#ffffff" });
      const image = new Image();
      image.src = jpeg;
      await image.decode();
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const scale = Math.min(pageW / image.width, pageH / image.height);
      const w = image.width * scale;
      pdf.addImage(jpeg, "JPEG", (pageW - w) / 2, 0, w, image.height * scale);
      pdf.save(`${r.regId}.pdf`);
    } catch (err) {
      console.error("[expedition] making the receipt PDF failed", err);
      setFailed(true);
    } finally {
      setMaking(false);
    }
  };

  const sendAgain = () => {
    setResent("");
    start(async () => {
      const result = await resendExpeditionLink(r.whatsapp);
      if (!result.ok) setResent(result.message);
      else if (result.status === "sent") setResent("Sent again. Please check WhatsApp.");
      else if (result.status === "waiting")
        setResent("The Zoom link is not ready yet. It will come on your WhatsApp number before the meeting.");
      else setResent("The message could not be sent just now. Please try again in a few minutes.");
    });
  };

  const rows: [string, string][] = [
    ["Name", r.name],
    ["WhatsApp number", phone(r.whatsapp)],
    ["District", r.district],
    ["Age", String(r.age)],
    ["Gender", GENDERS[r.gender] ?? ""],
  ];
  const payment: [string, string][] = [
    ["Amount", `Rs ${r.fee}`],
    ["Paid by", "Online (Razorpay)"],
    ["Payment ID", r.razorpayPaymentId],
    ["Order ID", r.razorpayOrderId],
    ["Paid on", istDateTime(r.paidAt)],
    ["Paid to", payee],
  ];

  return (
    <div
      className="grid justify-items-center gap-4 rounded-card border border-line bg-light px-6 py-10 text-center shadow-card"
      role="status"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-[32px] text-success">
        <CheckCircle />
      </span>
      <h2 className="font-display text-[26px] font-extrabold">You are registered.</h2>
      <p className="text-[13px] text-muted">Your registration ID</p>
      <p className="rounded-card border border-dashed border-line bg-soft px-5 py-3 font-display text-[26px] font-extrabold tracking-[0.04em]">
        {r.regId}
      </p>
      <p className="max-w-[46ch] text-muted">
        {r.zoomLink ? "The Zoom meeting link has been sent" : "The Zoom meeting link will be sent"} to your WhatsApp number{" "}
        <b className="text-dark">{phone(r.whatsapp)}</b>. Meeting: {expedition.meeting.long}. Please join on time.
      </p>
      {r.zoomLink && (
        <a href={r.zoomLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          Open the Zoom meeting link
        </a>
      )}
      <button type="button" onClick={download} disabled={making} className="btn btn-primary mt-1">
        <FileText /> {making ? "Making the PDF…" : "Download receipt (PDF)"}
      </button>
      {failed && (
        <p role="alert" className="text-[14px] text-danger">
          The PDF could not be made. Please try again.
        </p>
      )}
      <p className="max-w-[46ch] text-[13.5px] text-muted">
        Did not get the WhatsApp message in 10 minutes? Check the number and{" "}
        <button type="button" onClick={sendAgain} disabled={pending} className="font-bold text-primary underline disabled:opacity-50">
          {pending ? "sending…" : "send again"}
        </button>
        .
      </p>
      {resent && <p className="max-w-[46ch] text-[14px] text-muted">{resent}</p>}

      {/* The PDF page, drawn off screen at A4 width. */}
      <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[10000px]">
        <div ref={sheet} className="w-[794px] bg-light px-12 py-10 text-left text-[14px] text-dark">
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
            <p className="font-display text-[13px] font-bold tracking-[0.08em] text-primary uppercase">{expedition.name}</p>
            <p className="font-display text-[13px] font-bold tracking-[0.12em] text-primary uppercase">Registration receipt</p>
          </div>

          <div className="mt-3 flex items-end justify-between gap-6 rounded-card bg-soft px-5 py-4">
            <div>
              <p className="text-[12px] text-muted">Registration ID</p>
              <p className="font-display text-[28px] font-extrabold tracking-[0.03em]">{r.regId}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted">Issued</p>
              <p className="font-semibold">{istDateTime(r.paidAt)}</p>
              <p className="mt-1 inline-block rounded-full bg-success/12 px-3 py-0.5 font-display text-[13px] font-bold text-success">
                Paid · Rs {r.fee}
              </p>
            </div>
          </div>

          {[
            ["Participant", rows],
            ["Payment", payment],
          ].map(([title, list]) => (
            <div key={title as string} className="mt-5">
              <p className="font-display text-[15px] font-extrabold">{title as string}</p>
              <dl className="mt-1.5 border-t border-line">
                {(list as [string, string][]).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[190px_1fr] gap-3 border-b border-line py-1.75">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium [overflow-wrap:anywhere]">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="mt-6 rounded-card border-2 border-success/40 px-5 py-4">
            <p className="font-display text-[15px] font-extrabold">Zoom meeting</p>
            <p className="mt-1">{expedition.meeting.long} (IST)</p>
            <p className="mt-1 text-[13px] text-muted">
              The meeting link is sent on WhatsApp to {phone(r.whatsapp)}. All details of the expedition are shared only in this meeting.
            </p>
          </div>

          <p className="mt-6 border-t border-line pt-3 text-[12px] text-muted">
            This is a receipt for the registration fee only. Registration does not mean selection; a limited number of people will be
            selected for the expedition.
          </p>
        </div>
      </div>
    </div>
  );
}
