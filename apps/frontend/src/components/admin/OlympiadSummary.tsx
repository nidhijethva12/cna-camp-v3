"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

const TYPE_LABELS: Record<string, string> = { reminder: "Reminder only", invited: "Invited by school", registered: "Registered" };
const PAYMENT_LABELS: Record<string, string> = { free: "Free (₹0)", paid: "Paid", pending: "Payment pending", failed: "Payment failed" };
const PARTICIPANT_LABELS: Record<string, string> = { student: "Student", teacher: "Teacher", adult: "Other (18+)" };
const SOURCE_LABELS: Record<string, string> = { direct: "Direct", school: "School", ambassador: "Ambassador" };

const FIELDS = [
  "regId",
  "type",
  "name",
  "participant",
  "group",
  "dob",
  "fee",
  "paymentStatus",
  "paidAt",
  "institution",
  "stage",
  "district",
  "city",
  "whatsapp",
  "email",
  "parentName",
  "parentPhone",
  "quizDate",
  "quizTime",
  "source",
  "code",
  "registeredAt",
  "feeCheck",
  "documents.photo",
] as const;

const day = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
const dayTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function format(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatter.format(date);
}

const join = (...parts: string[]) => parts.filter(Boolean).join(" · ");

/** The person at a glance, above the tabs: who they are, their group, payment and how to reach them. */
export function OlympiadSummary() {
  const { id } = useDocumentInfo();
  const v = useFormFields(([fields]) => {
    const values = {} as Record<(typeof FIELDS)[number], string>;
    for (const name of FIELDS) {
      const value = fields[name]?.value;
      values[name] = value == null || value === false ? "" : String(value);
    }
    return values;
  });

  if (!id) return null;
  const payment = v.type === "registered" ? v.paymentStatus || "pending" : "";
  const facts: [label: string, value: string][] = [
    ["Registered as", join(PARTICIPANT_LABELS[v.participant] ?? "", v.dob ? `born ${format(v.dob, day)}` : "")],
    ["School / college", join(v.institution, v.stage)],
    ["Place", join(v.city, v.district)],
    ["WhatsApp", v.whatsapp],
    ["Email", v.email],
    ["Parent", join(v.parentName, v.parentPhone)],
    ["Quiz", join(v.quizDate, v.quizTime)],
    ["Fee", Number(v.fee) > 0 ? join(`₹${v.fee}`, v.paidAt ? `paid ${format(v.paidAt, dayTime)}` : "") : v.fee ? "Free" : ""],
    ["Came through", join(SOURCE_LABELS[v.source] ?? "", v.code)],
    ["Registered on", v.registeredAt ? format(v.registeredAt, dayTime) : ""],
  ];

  return (
    <div className="cna-sum">
      {v["documents.photo"] && (
        // eslint-disable-next-line @next/next/no-img-element -- private, uncached admin file
        <img className="cna-sum__photo" src={`/api/olympiad-people/${id}/document/photo`} alt="" />
      )}
      <div className="cna-sum__body">
        <div className="cna-sum__top">
          <strong className="cna-sum__name">{v.name}</strong>
          {v.regId && <span className="cna-sum__id">{v.regId}</span>}
        </div>
        <div className="cna-sum__badges">
          <span className="cna-badge" data-tone={v.type === "registered" ? "good" : "muted"}>
            {TYPE_LABELS[v.type] ?? v.type}
          </span>
          {v.group && <span className="cna-badge">Group {v.group}</span>}
          {payment && (
            <span className="cna-badge" data-tone={payment === "paid" || payment === "free" ? "good" : "warn"}>
              {PAYMENT_LABELS[payment] ?? payment}
            </span>
          )}
          {v.feeCheck && (
            <span className="cna-badge" data-tone="warn">
              Check the school proof
            </span>
          )}
        </div>
        <dl className="cna-sum__facts">
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
