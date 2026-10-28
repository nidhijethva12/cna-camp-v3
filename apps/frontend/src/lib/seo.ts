/** Only Vercel production deployments are indexable; previews and local environments stay noindex. */
export const isIndexable = process.env.VERCEL_ENV === "production";

/**
 * Use the canonical custom domain in production. Preview URLs must never leak into canonical URLs,
 * structured data, or the sitemap.
 *
 * A preview (staging) uses SITE_URL when set, e.g. https://staging.cnacamp.com, else the branch's
 * stable Vercel address. The admin only accepts logins from this one address (csrf), so it must be
 * the address people actually open.
 */
function resolveSiteUrl() {
  if (process.env.VERCEL_ENV === "production") return "https://cnacamp.com";
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");

  const host = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  return host ? `https://${host}` : `http://localhost:${process.env.PORT || 3000}`;
}

export const siteUrl = resolveSiteUrl();

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
