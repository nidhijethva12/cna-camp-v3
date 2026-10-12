import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";
import { revalidateSite } from "../hooks/revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Videos: CollectionConfig = {
  slug: "videos",
  labels: { singular: "Video", plural: "Videos" },
  admin: {
    group: "Website",
    useAsTitle: "title",
    defaultColumns: ["title", "showInGallery", "order", "updatedAt"],
    description: "Short phone clips (MP4). Keep each under about 15 MB; visitors load a clip only when they press play.",
  },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  hooks: revalidateSite,
  defaultSort: "order",
  upload: {
    // Local disk (gitignored) in development; Vercel Blob when its token is set.
    staticDir: path.resolve(dirname, "../../../media/videos"),
    mimeTypes: ["video/mp4", "video/webm"],
  },
  fields: [
    { name: "title", type: "text", required: true, admin: { description: "Shown on the card, e.g. “Camp under the snow peaks”." } },
    {
      name: "poster",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Still frame shown until the video plays. Its alt text describes the clip." },
    },
    {
      type: "row",
      fields: [
        {
          name: "orientation",
          type: "select",
          required: true,
          defaultValue: "portrait",
          options: [
            { label: "Portrait (phone held upright)", value: "portrait" },
            { label: "Landscape", value: "landscape" },
          ],
        },
        { name: "order", type: "number", admin: { description: "Lower numbers show first." } },
      ],
    },
    {
      name: "ambient",
      label: "Loop silently",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Plays on its own, muted and looping, like a moving photo. Only for clips with no people talking." },
    },
    { name: "showInGallery", label: "Show on the Gallery page", type: "checkbox", defaultValue: true },
  ],
};
