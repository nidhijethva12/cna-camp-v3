import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from "payload";
import { canEdit, publishedOrSignedIn, roleOf, signedIn } from "../access";
import { seoField, slugField } from "../fields";
import { revalidateSite } from "../hooks/revalidate";
import { sitePreview } from "../preview";

/** Authors write and save drafts; an Editor or Admin reviews and publishes. */
const authorsSaveDrafts: CollectionBeforeChangeHook = ({ data, req }) => {
  if (roleOf(req.user) === "author" && data._status === "published") {
    throw new APIError("Authors can save drafts only. An Editor or Admin will publish this post.", 403, null, true);
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Blog post", plural: "Blog posts" },
  admin: {
    group: "Website",
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status"],
    preview: sitePreview((doc) => `/blog/${doc.slug}`),
  },
  access: { read: publishedOrSignedIn, create: signedIn, update: signedIn, delete: canEdit },
  versions: { drafts: true, maxPerDoc: 30 },
  defaultSort: "-publishedAt",
  hooks: { ...revalidateSite, beforeChange: [authorsSaveDrafts] },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "excerpt", type: "textarea", required: true, maxLength: 240 },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    { name: "content", type: "richText", required: true },
    { name: "relatedTrips", type: "relationship", relationTo: "trips", hasMany: true },
    {
      name: "faqs",
      label: "FAQs",
      type: "array",
      admin: { description: "Shown under the post and marked up for search engines." },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    seoField,
    slugField("title"),
    {
      name: "publishedAt",
      type: "date",
      index: true,
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
      hooks: {
        beforeChange: [({ value, siblingData }) => value ?? (siblingData._status === "published" ? new Date().toISOString() : value)],
      },
    },
    { name: "author", type: "relationship", relationTo: "users", admin: { position: "sidebar" } },
    {
      name: "authorName",
      label: "Author name",
      type: "text",
      maxLength: 60,
      admin: { position: "sidebar", description: "Shown on the post before the date. Empty shows “Team CNA”." },
    },
  ],
};
