import type { CollectionConfig } from "payload";
import { signedIn } from "../access";

/** Leads from the site forms. Created only by the server action (never via the public API). */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  admin: {
    group: "Leads",
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "email", "trip", "travellerType", "status", "createdAt"],
    listSearchableFields: ["name", "phone", "email"],
  },
  // Personal data (DPDP Act): the signed-in admin only, never the public API.
  access: { create: () => false, read: signedIn, update: signedIn, delete: signedIn },
  defaultSort: "-createdAt",
  // The enquiry action's rate limits count recent rows per visitor and per address.
  indexes: [{ fields: ["meta.ipHash", "createdAt"] }, { fields: ["email", "createdAt"] }],
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          index: true,
          options: [
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Booked", value: "booked" },
            { label: "Closed", value: "closed" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "phone", type: "text", required: true, index: true },
        { name: "email", type: "email" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "trip", type: "relationship", relationTo: "trips" },
        { name: "tripName", type: "text", admin: { readOnly: true, description: "Snapshot at the time of the enquiry." } },
      ],
    },
    { name: "travellerType", label: "Who's travelling", type: "text" },
    { name: "message", type: "textarea" },
    { name: "internalNotes", type: "textarea", admin: { description: "Visible to the CNA team only." } },
    {
      name: "meta",
      type: "group",
      admin: { readOnly: true },
      fields: [
        { name: "sourcePath", type: "text", admin: { description: "The page the form was sent from." } },
        { name: "consentAt", type: "date" },
        // Keyed hash of the sender's IP, only for rate limiting; never the IP itself.
        { name: "ipHash", type: "text", index: true, admin: { hidden: true } },
      ],
    },
  ],
};
