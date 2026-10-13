import { siteUrl } from "../lib/seo";

/** Adds a "Preview" button in the admin that opens the published page on the site. */
export const sitePreview =
  <T extends Record<string, unknown>>(pathFor: (doc: T) => string | null) =>
  (doc: Record<string, unknown>) => {
    const path = pathFor(doc as T);
    return path ? `${siteUrl}${path}` : null;
  };
