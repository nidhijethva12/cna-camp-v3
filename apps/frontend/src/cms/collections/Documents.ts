import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { anyone, canEdit, hiddenFromAuthors } from "../access";
import { revalidateSite } from "../hooks/revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** PDFs the site links to, such as official Olympiad notices and syllabi. */
export const Documents: CollectionConfig = {
  slug: "documents",
  labels: { singular: "PDF", plural: "PDFs" },
  admin: { hidden: hiddenFromAuthors, group: "Website", useAsTitle: "title", defaultColumns: ["title", "filename", "updatedAt"] },
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  hooks: revalidateSite,
  upload: {
    // Local disk (gitignored) in development; Vercel Blob when its token is set (payload.config.ts).
    staticDir: path.resolve(dirname, "../../../media/documents"),
    mimeTypes: ["application/pdf"],
  },
  fields: [
    { name: "title", type: "text", required: true, admin: { description: "What the PDF is, e.g. “Olympiad 2.0 official notice”." } },
  ],
};
