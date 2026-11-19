import type { CollectionConfig } from "payload";
import { canEdit, canManageRecords, hiddenFromAuthors } from "../../access";
import { assignCodeOnApproval, notifyOnApproval } from "./approval";
import { hashNewPassword, loginFields, lowerCaseEmail } from "./login";
import { districtOptions, institutionTypeOptions, partnerStatusOptions } from "./options";

/**
 * School Partners. A school signs up once; approving it gives it a school code (SCH-RJK-001) and a
 * coordinator dashboard. Only approved government schools unlock the lower government fee.
 */
export const OlympiadSchools: CollectionConfig = {
  slug: "olympiad-schools",
  labels: { singular: "School", plural: "Schools" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    useAsTitle: "name",
    defaultColumns: ["name", "code", "status", "type", "district", "stats.students", "stats.paid"],
    listSearchableFields: ["name", "udise", "code", "coordinator.whatsapp"],
  },
  access: { create: canManageRecords, read: canManageRecords, update: canManageRecords, delete: canEdit },
  defaultSort: "-createdAt",
  hooks: { beforeChange: [assignCodeOnApproval, hashNewPassword], afterChange: [notifyOnApproval] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "status", type: "select", required: true, defaultValue: "pending", index: true, options: partnerStatusOptions },
        { name: "code", label: "School code", type: "text", index: true, admin: { readOnly: true, description: "Given on approval." } },
        { name: "approvedAt", type: "date", admin: { readOnly: true } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", label: "School or college name", type: "text", required: true, maxLength: 120 },
        { name: "udise", label: "UDISE code", type: "text", required: true, index: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "type", type: "select", required: true, options: institutionTypeOptions },
        { name: "district", type: "select", required: true, options: districtOptions },
        { name: "principal", label: "Principal's name", type: "text", required: true },
      ],
    },
    {
      name: "coordinator",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", label: "Coordinator teacher", type: "text", required: true },
            { name: "whatsapp", label: "Coordinator WhatsApp", type: "text", required: true, index: true },
            {
              name: "email",
              label: "School email",
              type: "email",
              required: true,
              hooks: { beforeValidate: [lowerCaseEmail] },
              admin: { description: "Also the dashboard login." },
            },
          ],
        },
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
            { name: "students", label: "Students added", type: "number", defaultValue: 0 },
            { name: "paid", label: "Paid", type: "number", defaultValue: 0 },
          ],
        },
      ],
    },
    loginFields("coordinator.email"),
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
