import type { CollectionConfig } from "payload";
import { anyone, canEdit, hiddenFromAuthors } from "../access";
import { sampleField } from "../fields";
import { revalidateSite } from "../hooks/revalidate";

/** Main donors, shown in a scrolling strip on the home page. */
export const Donors: CollectionConfig = {
  slug: "donors",
  labels: { singular: "Donor", plural: "Donors" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Website",
    useAsTitle: "name",
    defaultColumns: ["name", "company", "amount", "order", "isSample"],
    description: "Shown on the home page in the order below. The phone number is for the team only and never appears on the site.",
  },
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  defaultSort: "order",
  hooks: revalidateSite,
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "profession", type: "text", admin: { description: "e.g. “Doctor”, “Businessman”" } },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        { name: "company", type: "text", admin: { description: "Company or organisation, if any." } },
        { name: "amount", label: "Donation (₹)", type: "number", min: 0, admin: { description: "Leave empty to hide the amount." } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          // Team records only: the public site and API never receive it.
          access: { read: ({ req }) => Boolean(req.user) },
          admin: { description: "For the team's records. Not shown on the site." },
        },
        { name: "order", type: "number", defaultValue: 10, admin: { description: "Lower numbers show first." } },
      ],
    },
    sampleField,
  ],
};
