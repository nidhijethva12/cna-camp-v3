/** Only the production deployment sets this; everything else is noindex + robots disallow. */
export const isIndexable = process.env.SITE_INDEXABLE === "true";

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const isLocal = !configured || /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(configured);
  // Canonicals, the sitemap, structured data and the CMS's CSRF origin all come from this value.
  if (process.env.VERCEL_ENV === "production" && isLocal) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be the live https:// domain on the production deployment");
  }
  // Preview deployments use their own address, so links and admin logins work there.
  if (process.env.VERCEL_ENV === "preview" && isLocal && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (configured) return configured;
  if (isIndexable) throw new Error("NEXT_PUBLIC_SITE_URL must be set when SITE_INDEXABLE=true");
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
