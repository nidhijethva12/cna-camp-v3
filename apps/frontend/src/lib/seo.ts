/** Only the production deployment sets this; everything else is noindex + robots disallow. */
export const isIndexable = process.env.SITE_INDEXABLE === "true";

/**
 * The site's own address, for canonicals, the sitemap, structured data and the CMS's CSRF origin.
 * Vercel provides it: production uses the project's production domain (the custom domain once one is
 * added), previews their own deployment address. Locally it is localhost.
 */
function resolveSiteUrl() {
  const host = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL;
  return host ? `https://${host}` : `http://localhost:${process.env.PORT || 3000}`;
}

export const siteUrl = resolveSiteUrl();

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
