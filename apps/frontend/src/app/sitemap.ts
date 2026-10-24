import type { MetadataRoute } from "next";
import { getPosts, getTrips } from "@/lib/content";
import { absoluteUrl, isIndexable } from "@/lib/seo";

// Rebuilt hourly so new trips and posts appear without a deploy.
export const revalidate = 3600;
const publicPages = [
  "/",
  "/trips",
  "/batches",
  "/group-trips",
  "/travellers",
  "/about",
  "/gallery",
  "/blog",
  "/contact",
  "/terms",
  "/cancellation",
  "/privacy",
  "/photo-credits",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable) return [];

  const [trips, posts] = await Promise.all([getTrips(), getPosts()]);
  return [
    ...publicPages.map((path) => ({ url: absoluteUrl(path) })),
    ...trips.map((trip) => ({ url: absoluteUrl(`/trips/${trip.slug}`), lastModified: trip.updatedAt })),
    ...posts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.updatedAt })),
  ];
}
