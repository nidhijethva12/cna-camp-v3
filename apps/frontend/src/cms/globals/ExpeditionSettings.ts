import type { GlobalConfig } from "payload";
import { canManageRecords, hiddenFromAuthors } from "../access";

/**
 * Sarasvati - Sindhu Darshan Yatra: the registration dates, the fee and the Zoom link. The link is
 * never public, so only signed-in staff can read these settings; the page reads its dates on the server.
 */
export const ExpeditionSettings: GlobalConfig = {
  slug: "expedition-settings",
  label: "Yatra settings",
  admin: { hidden: hiddenFromAuthors, group: "Sindhu Darshan Yatra" },
  access: { read: canManageRecords, update: canManageRecords },
  fields: [
    {
      name: "zoomLink",
      label: "Zoom meeting link",
      type: "text",
      validate: (value: unknown) => !value || /^https:\/\/\S+$/.test(String(value).trim()) || "Paste the full link, starting with https://",
      admin: {
        description:
          "Sent on WhatsApp to everyone who has paid, and shown to them after payment. It is never shown on the public page. After adding or changing it, use “Send the Zoom link” in the Registrations list.",
      },
    },
    {
      name: "registrationMode",
      type: "select",
      required: true,
      defaultValue: "auto",
      options: [
        { label: "Automatic: open between the dates below", value: "auto" },
        { label: "Open now", value: "open" },
        { label: "Closed now", value: "closed" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "opensAt",
          label: "Registration opens",
          type: "date",
          required: true,
          defaultValue: "2026-11-29T12:36:00.000Z",
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
        {
          name: "closesAt",
          label: "Registration closes",
          type: "date",
          required: true,
          defaultValue: "2026-12-26T09:48:00.000Z",
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "fee", label: "Registration fee (₹)", type: "number", required: true, min: 1, defaultValue: 108 },
        { name: "minAge", label: "Minimum age", type: "number", required: true, min: 1, max: 90, defaultValue: 18 },
      ],
    },
  ],
};
