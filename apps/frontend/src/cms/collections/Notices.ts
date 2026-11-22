import type { CollectionConfig } from "payload";
import { anyone, canEdit, contentHidden } from "../access";
import { httpUrl } from "../fields";
import { revalidateSite } from "../hooks/revalidate";

/** Olympiad notice board: one line per notice, with an optional PDF or link. Pinned notices show first. */
export const Notices: CollectionConfig = {
  slug: "notices",
  labels: { singular: "Notice", plural: "Notices" },
  admin: {
    hidden: contentHidden,
    group: "Olympiad",
    useAsTitle: "text",
    defaultColumns: ["text", "type", "date", "pinned", "order"],
    description: "Each notice is one line on the Olympiad page notice board. Pinned notices show first, then lower order numbers.",
  },
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  defaultSort: ["-pinned", "order"],
  hooks: revalidateSite,
  fields: [
    {
      name: "edition",
      type: "select",
      required: true,
      defaultValue: "2.0",
      options: [
        { label: "Olympiad 2.0", value: "2.0" },
        { label: "Olympiad 1.0 (archived)", value: "1.0" },
      ],
      admin: { position: "sidebar", description: "Only notices of the current Olympiad show on the page." },
    },
    { name: "text", label: "Notice text", type: "text", required: true, maxLength: 200 },
    {
      name: "details",
      type: "text",
      maxLength: 160,
      admin: { description: "Optional small line, e.g. “Notice no. 02/2026 · Gujarati PDF”." },
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          defaultValue: "official",
          options: [
            { label: "Official", value: "official" },
            { label: "Important", value: "important" },
            { label: "Last date", value: "date" },
            { label: "PDF", value: "pdf" },
            { label: "Result", value: "result" },
          ],
        },
        { name: "date", type: "date", admin: { description: "Shown on the notice, e.g. the round date." } },
        { name: "pinned", type: "checkbox", defaultValue: false, admin: { description: "Pinned notices show at the top." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "file", label: "PDF", type: "upload", relationTo: "documents", admin: { description: "Opens in a new tab." } },
        { name: "link", type: "text", validate: httpUrl, admin: { description: "Or a page to open (https://…), if there is no PDF." } },
        { name: "order", type: "number", defaultValue: 10, admin: { description: "Lower numbers show first." } },
      ],
    },
  ],
};
