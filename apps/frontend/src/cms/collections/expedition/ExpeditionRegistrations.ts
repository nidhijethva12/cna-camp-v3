import type { CollectionConfig, Field, PayloadHandler, Where } from "payload";
import { canManageRecords, handlesRecords, hiddenFromAuthors, roleOf } from "../../access";
import { backendAsk } from "../../backend";

const privateHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const notFound = () => new Response(null, { status: 404, headers: privateHeaders });

const STATUS = [
  { label: "Not paid", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Payment failed", value: "failed" },
];
const GENDER = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Prefer not to say", value: "undisclosed" },
];
const MESSAGE = [
  { label: "Waiting for the Zoom link", value: "waiting" },
  { label: "WhatsApp not set up", value: "skipped" },
  { label: "Sent", value: "sent" },
  { label: "Delivered", value: "delivered" },
  { label: "Read", value: "read" },
  { label: "Failed", value: "failed" },
];
const label = (options: { label: string; value: string }[], value?: string | null) => options.find((o) => o.value === value)?.label ?? "";

const SEARCHABLE = ["regId", "name", "whatsapp", "district", "razorpayPaymentId"];

/** A WhatsApp message's progress, as the site saved it. */
const message = (name: string, title: string): Field => ({
  name,
  label: title,
  type: "group",
  fields: [
    {
      type: "row",
      fields: [
        { name: "status", type: "select", options: MESSAGE },
        { name: "at", label: "Last sent", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    { name: "error", label: "Reason, if it failed", type: "text" },
    { name: "providerId", type: "text", admin: { hidden: true } },
  ],
});

const csvCell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  // A leading =, +, - or @ would run as a formula when the file is opened in Excel.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const istDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "");

/** The list as a CSV file, with the filters and search the admin has applied. */
const exportCsv: PayloadHandler = async (req) => {
  if (!handlesRecords(req.user)) return notFound();
  const filters = (req.query?.where ?? {}) as Where;
  const search = typeof req.query?.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const searched: Where = search ? { or: SEARCHABLE.map((field) => ({ [field]: { like: search } })) } : {};
  const { docs } = await req.payload.find({
    collection: "expedition-registrations",
    where: search ? { and: [filters, searched] } : filters,
    sort: "-createdAt",
    pagination: false,
    depth: 0,
    overrideAccess: false,
    user: req.user,
  });
  const rows = [
    [
      "Registration ID",
      "Name",
      "WhatsApp (+91)",
      "District",
      "Age",
      "Gender",
      "Payment",
      "Fee (Rs)",
      "Paid on",
      "Razorpay payment ID",
      "Razorpay order ID",
      "Zoom link message",
      "Reminder",
      "Registered on",
    ],
    ...docs.map((d) => [
      d.regId,
      d.name,
      // Ten digits, so a spreadsheet neither reads the number as a formula nor rounds it.
      d.whatsapp?.replace(/^\+91/, ""),
      d.district,
      d.age,
      label(GENDER, d.gender),
      label(STATUS, d.status),
      d.fee,
      istDateTime(d.paidAt),
      d.razorpayPaymentId,
      d.razorpayOrderId,
      label(MESSAGE, d.message?.status),
      label(MESSAGE, d.reminder?.status),
      istDateTime(d.createdAt),
    ]),
  ];
  // The BOM makes Excel read the file as UTF-8, so Gujarati names show correctly.
  const body = `﻿${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
  return new Response(body, {
    headers: {
      ...privateHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sindhu-darshan-yatra-registrations-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })}.csv"`,
    },
  });
};

const answer = (result: { ok: true; data: unknown } | { ok: false; message: string }) =>
  result.ok
    ? Response.json(result.data, { headers: privateHeaders })
    : Response.json({ message: result.message }, { status: 400, headers: privateHeaders });

/** "Send again": the Zoom link on WhatsApp to one paid person. */
const sendAgain: PayloadHandler = async (req) => {
  if (!handlesRecords(req.user)) return notFound();
  return answer(await backendAsk("/expedition/admin/resend", { id: String(req.routeParams?.id ?? "") }));
};

/** "Send to all": the Zoom link to paid people who have not got it, or the meeting-day reminder to everyone paid. */
const sendAll: PayloadHandler = async (req) => {
  if (!handlesRecords(req.user)) return notFound();
  const kind = req.routeParams?.kind === "reminder" ? "reminder" : "link";
  return answer(await backendAsk("/expedition/admin/send-all", { kind }));
};

/**
 * People who registered for the Sarasvati - Sindhu Darshan Yatra information meeting. Written only by
 * the site (the form and Razorpay), so the list stays a true record; staff read it, export it and send
 * the Zoom link again.
 */
export const ExpeditionRegistrations: CollectionConfig = {
  slug: "expedition-registrations",
  labels: { singular: "Registration", plural: "Registrations" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Sindhu Darshan Yatra",
    useAsTitle: "name",
    defaultColumns: ["regId", "name", "whatsapp", "district", "age", "status", "paidAt"],
    listSearchableFields: SEARCHABLE,
    description: "Everyone who filled the form. “Paid” people get the Zoom link on WhatsApp.",
    components: { beforeListTable: ["@/components/admin/ExpeditionTools#ExpeditionTools"] },
  },
  access: {
    create: () => false,
    read: canManageRecords,
    update: () => false,
    // A paid registration is the record of money received and stays. An Admin may clear ones nobody paid.
    delete: ({ req }) => (roleOf(req.user) === "admin" ? { status: { not_equals: "paid" } } : false),
  },
  defaultSort: "-createdAt",
  endpoints: [
    { path: "/export", method: "get", handler: exportCsv },
    { path: "/send-all/:kind", method: "post", handler: sendAll },
    { path: "/:id/send-again", method: "post", handler: sendAgain },
  ],
  fields: [
    { name: "sendAgain", type: "ui", admin: { components: { Field: "@/components/admin/ExpeditionSendAgain#ExpeditionSendAgain" } } },
    {
      type: "row",
      fields: [
        { name: "regId", label: "Registration ID", type: "text", index: true },
        { name: "status", label: "Payment", type: "select", options: STATUS, defaultValue: "pending", index: true },
        { name: "fee", label: "Fee (₹)", type: "number" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text" },
        { name: "whatsapp", label: "WhatsApp number", type: "text", unique: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "district", type: "text", index: true },
        { name: "age", type: "number" },
        { name: "gender", type: "select", options: GENDER },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "paidAt", label: "Paid on", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "razorpayPaymentId", label: "Razorpay payment ID", type: "text", index: true },
        { name: "razorpayOrderId", label: "Razorpay order ID", type: "text" },
      ],
    },
    message("message", "Zoom link message (WhatsApp)"),
    message("reminder", "Meeting-day reminder (WhatsApp)"),
    { name: "failureReason", label: "Why the payment failed", type: "text" },
    {
      name: "needsRefund",
      label: "Refund the extra payment",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "This person paid twice. Refund the second payment in Razorpay." },
    },
    { name: "orders", type: "text", hasMany: true, index: true, admin: { hidden: true } },
    { name: "resends", type: "number", admin: { hidden: true } },
    {
      name: "agreedAt",
      label: "Agreed to the terms on",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    { name: "ipHash", type: "text", admin: { hidden: true } },
  ],
};
