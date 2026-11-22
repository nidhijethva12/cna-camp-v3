import type { CollectionConfig } from "payload";
import { canEdit, canManageRecords, hiddenFromAuthors } from "../../access";
import { assignCodeOnApproval, notifyOnApproval } from "./approval";
import { hashNewPassword, loginFields, lowerCaseEmail } from "./login";
import { ambassadorRoleOptions, partnerStatusOptions } from "./options";

/**
 * Olympiad Ambassadors: people who share a personal code. Approving a request (or adding one here as
 * Approved) gives a code (CNA-AMB-0001) and sends the welcome message. Blocking pauses the code.
 */
export const OlympiadAmbassadors: CollectionConfig = {
  slug: "olympiad-ambassadors",
  labels: { singular: "Ambassador", plural: "Ambassadors" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    useAsTitle: "name",
    defaultColumns: ["name", "code", "status", "stats.paid", "stats.registered", "stats.clicks", "city"],
    listSearchableFields: ["name", "whatsapp", "email", "code", "city"],
    description: "Sort by Paid to see the leaderboard. Only paid registrations count towards milestones.",
  },
  access: { create: canManageRecords, read: canManageRecords, update: canManageRecords, delete: canEdit },
  defaultSort: "-stats.paid",
  hooks: { beforeChange: [hashNewPassword, assignCodeOnApproval], afterChange: [notifyOnApproval] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "status", type: "select", required: true, defaultValue: "pending", index: true, options: partnerStatusOptions },
        { name: "code", type: "text", index: true, admin: { readOnly: true, description: "Given on approval." } },
        { name: "approvedAt", type: "date", admin: { readOnly: true } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true, maxLength: 80 },
        { name: "whatsapp", label: "WhatsApp number", type: "text", required: true, unique: true },
        { name: "email", type: "email", hooks: { beforeValidate: [lowerCaseEmail] }, admin: { description: "Also the dashboard login." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "city", type: "text" },
        {
          name: "language",
          label: "Message language",
          type: "select",
          defaultValue: "en",
          options: [
            { label: "English", value: "en" },
            { label: "Gujarati", value: "gu" },
          ],
          admin: { description: "WhatsApp messages (approval, password link) are sent in this language." },
        },
        { name: "role", label: "They are a", type: "select", options: ambassadorRoleOptions },
      ],
    },
    {
      name: "stats",
      type: "group",
      // Counted by the Olympiad API; an admin save must not write back the numbers it loaded.
      access: { update: () => false },
      admin: { readOnly: true, description: "Kept up to date automatically." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "clicks", label: "Link opened", type: "number", defaultValue: 0 },
            { name: "registered", label: "Registered", type: "number", defaultValue: 0 },
            { name: "paid", label: "Paid", type: "number", defaultValue: 0, index: true },
          ],
        },
      ],
    },
    {
      name: "rewards",
      label: "Rewards given",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            { name: "milestone", label: "At paid registrations", type: "number", required: true },
            { name: "givenOn", type: "date", required: true },
            { name: "note", type: "text" },
          ],
        },
      ],
    },
    loginFields("email"),
    { name: "notes", type: "textarea", admin: { description: "Visible to the CNA team only." } },
    {
      name: "meta",
      type: "group",
      admin: { position: "sidebar", readOnly: true },
      fields: [
        { name: "consentAt", type: "date" },
        { name: "ipHash", type: "text", index: true, admin: { hidden: true } },
      ],
    },
  ],
};
