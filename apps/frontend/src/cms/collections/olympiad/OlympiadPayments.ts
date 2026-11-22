import type { CollectionConfig, Field } from "payload";
import { OFFICE_METHOD_LABELS, OFFICE_METHODS } from "../../../lib/olympiad/officePayments";
import { canManageRecords, hiddenFromAuthors, roleOf } from "../../access";

/** Fields only the site writes; an admin save keeps what is stored. */
const siteOwned = (fields: Field[]): Field[] =>
  fields.map((f) =>
    f.type === "row" ? { ...f, fields: siteOwned(f.fields) } : "name" in f ? ({ ...f, access: { update: () => false } } as Field) : f,
  );

/**
 * One Razorpay order: a single registration, or many students a school pays for at once. Written only
 * by the site (order creation and the Razorpay webhook), so it stays a true record. The team can only
 * clear "Refund this payment" once the refund is done in Razorpay; an Admin can delete orders that were never paid.
 */
export const OlympiadPayments: CollectionConfig = {
  slug: "olympiad-payments",
  labels: { singular: "Payment", plural: "Payments" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    useAsTitle: "razorpayOrderId",
    defaultColumns: ["razorpayOrderId", "people", "amount", "status", "mode", "paidBy", "createdAt"],
    listSearchableFields: ["razorpayOrderId", "razorpayPaymentId", "receipt"],
    // The list is the record of money received. Orders nobody paid stay in the database (a person's
    // open payment window needs them) but are not shown.
    baseFilter: () => ({ status: { equals: "paid" } }),
    description: "Payments received, online and at the office. Orders that were opened but never paid are not listed.",
  },
  access: {
    create: () => false,
    read: canManageRecords,
    update: canManageRecords,
    // A paid order is the record of money received and stays. An Admin may clear orders nobody paid.
    delete: ({ req }) => (roleOf(req.user) === "admin" ? { status: { not_equals: "paid" } } : false),
  },
  defaultSort: "-createdAt",
  fields: [
    ...siteOwned([
      {
        type: "row",
        fields: [
          {
            name: "razorpayOrderId",
            label: "Order ID",
            type: "text",
            required: true,
            unique: true,
            admin: { description: "From Razorpay, or OFFICE-… for a fee recorded at the office." },
          },
          { name: "razorpayPaymentId", label: "Razorpay payment ID", type: "text", index: true },
          { name: "receipt", type: "text", required: true },
        ],
      },
      {
        type: "row",
        fields: [
          {
            name: "amount",
            type: "number",
            required: true,
            min: 100,
            admin: {
              description: "Kept in paise, as Razorpay does: 96300 is ₹963. The list shows rupees.",
              components: { Cell: "@/components/admin/RupeeCell#RupeeCell" },
            },
          },
          {
            name: "status",
            type: "select",
            required: true,
            defaultValue: "created",
            index: true,
            options: [
              { label: "Not paid", value: "created" },
              { label: "Paid", value: "paid" },
              { label: "Failed", value: "failed" },
            ],
          },
          {
            name: "mode",
            type: "select",
            required: true,
            defaultValue: "single",
            options: [
              { label: "One registration", value: "single" },
              { label: "School, many students", value: "bulk" },
            ],
          },
          {
            name: "paidBy",
            type: "select",
            required: true,
            defaultValue: "participant",
            options: [
              { label: "Participant or parent", value: "participant" },
              { label: "School", value: "school" },
              { label: "Recorded at the office", value: "office" },
            ],
          },
        ],
      },
      { name: "people", type: "relationship", relationTo: "olympiad-people", hasMany: true, required: true },
      { name: "school", type: "relationship", relationTo: "olympiad-schools" },
      { name: "paidAt", type: "date" },
      {
        type: "row",
        fields: [
          {
            name: "method",
            label: "Paid at the office by",
            type: "select",
            options: OFFICE_METHODS.map((value) => ({ value, label: OFFICE_METHOD_LABELS[value] })),
            admin: { description: "Empty for online (Razorpay) payments." },
          },
          { name: "reference", type: "text" },
          { name: "receivedBy", label: "Recorded by", type: "text" },
        ],
      },
      { name: "failureReason", type: "text" },
    ]),
    {
      name: "needsRefund",
      label: "Refund this payment",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        position: "sidebar",
        description: "Paid, but the person had already paid or had moved to a newer order. Refund it in Razorpay, then untick.",
      },
    },
  ],
};
