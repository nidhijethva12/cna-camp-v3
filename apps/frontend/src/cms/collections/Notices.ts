import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";
import { httpUrl } from "../fields";
import { revalidateSite } from "../hooks/revalidate";

/** Olympiad notice board: exam dates, results and announcements, newest first. */
export const Notices: CollectionConfig = {
  slug: "notices",
  labels: { singular: "Notice", plural: "Notices" },
  admin: {
    group: "Olympiad",
    useAsTitle: "title",
    defaultColumns: ["title", "date", "category", "important", "hideAfter"],
    description: "Shown on the Olympiad page notice board, newest first.",
  },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: "-date",
  hooks: revalidateSite,
  fields: [
    { name: "title", type: "text", required: true, maxLength: 140 },
    {
      type: "row",
      fields: [
        { name: "date", type: "date", required: true, index: true, admin: { date: { pickerAppearance: "dayOnly" } } },
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "general",
          options: [
            { label: "Exam", value: "exam" },
            { label: "Result", value: "result" },
            { label: "Registration", value: "registration" },
            { label: "General", value: "general" },
          ],
        },
      ],
    },
    { name: "details", type: "textarea", maxLength: 400 },
    {
      type: "row",
      fields: [
        { name: "link", type: "text", validate: httpUrl, admin: { description: "Optional, e.g. a PDF or the quiz link (https://…)." } },
        { name: "linkLabel", type: "text", admin: { description: "Button text, e.g. “Download PDF”. Default: “Open link”." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "important", label: "Mark as important", type: "checkbox", defaultValue: false },
        {
          name: "hideAfter",
          type: "date",
          admin: { date: { pickerAppearance: "dayOnly" }, description: "Optional. The notice disappears after this day." },
        },
      ],
    },
  ],
};
