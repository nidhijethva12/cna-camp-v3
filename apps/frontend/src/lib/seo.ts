/** Only Vercel production deployments are indexable; previews and local environments stay noindex. */
export const isIndexable = process.env.VERCEL_ENV === "production";

/**
 * Use the canonical custom domain in production. Preview URLs must never leak into canonical URLs,
 * structured data, or the sitemap.
 */
function resolveSiteUrl() {
  if (process.env.VERCEL_ENV === "production") return "https://cnacamp.com";

  const host = process.env.VERCEL_URL;
  return host ? `https://${host}` : `http://localhost:${process.env.PORT || 3000}`;
}

export const siteUrl = resolveSiteUrl();

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
