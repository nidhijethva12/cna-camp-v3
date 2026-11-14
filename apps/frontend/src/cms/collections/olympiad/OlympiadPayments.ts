import type { CollectionConfig, Field } from "payload";
import { canEdit, hiddenFromAuthors } from "../../access";

/** Fields only the site writes; an admin save keeps what is stored. */
const siteOwned = (fields: Field[]): Field[] =>
  fields.map((f) =>
    f.type === "row" ? { ...f, fields: siteOwned(f.fields) } : "name" in f ? ({ ...f, access: { update: () => false } } as Field) : f,
  );

/**
 * One Razorpay order: a single registration, or many students a school pays for at once. Written only
 * by the site (order creation and the Razorpay webhook), so it stays a true record. The team can only
 * clear "Refund this payment" once the refund is done in Razorpay.
 */
export const OlympiadPayments: CollectionConfig = {
  slug: "olympiad-payments",
  labels: { singular: "Payment", plural: "Payments" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    useAsTitle: "razorpayOrderId",
    defaultColumns: ["razorpayOrderId", "amount", "mode", "status", "paidBy", "createdAt"],
    listSearchableFields: ["razorpayOrderId", "razorpayPaymentId", "receipt"],
  },
  access: { create: () => false, read: canEdit, update: canEdit, delete: () => false },
  defaultSort: "-createdAt",
  fields: [
    ...siteOwned([
      {
        type: "row",
        fields: [
          { name: "razorpayOrderId", label: "Razorpay order ID", type: "text", required: true, unique: true },
          { name: "razorpayPaymentId", label: "Razorpay payment ID", type: "text", index: true },
          { name: "receipt", type: "text", required: true },
        ],
      },
      {
        type: "row",
        fields: [
          { name: "amount", label: "Amount (paise)", type: "number", required: true, min: 100 },
          {
            name: "status",
            type: "select",
            required: true,
            defaultValue: "created",
            index: true,
            options: [
              { label: "Created", value: "created" },
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
            ],
          },
        ],
      },
      { name: "people", type: "relationship", relationTo: "olympiad-people", hasMany: true, required: true },
      { name: "school", type: "relationship", relationTo: "olympiad-schools" },
      { name: "paidAt", type: "date" },
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
