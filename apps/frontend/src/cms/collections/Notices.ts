import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";
import { httpUrl } from "../fields";
import { revalidateSite } from "../hooks/revalidate";

/** Olympiad notice board: one line of text per notice, optionally linked (a PDF, a form). */
export const Notices: CollectionConfig = {
  slug: "notices",
  labels: { singular: "Notice", plural: "Notices" },
  admin: {
    group: "Olympiad",
    useAsTitle: "text",
    defaultColumns: ["text", "order", "link"],
    description: "Each notice is one line on the Olympiad page notice board. Lower order numbers show first.",
  },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: "order",
  hooks: revalidateSite,
  fields: [
    { name: "text", label: "Notice text", type: "text", required: true, maxLength: 200 },
    {
      type: "row",
      fields: [
        { name: "link", type: "text", validate: httpUrl, admin: { description: "Optional: a PDF or page to open (https://…)." } },
        { name: "order", type: "number", defaultValue: 10, admin: { description: "Lower numbers show first." } },
      ],
    },
  ],
};
