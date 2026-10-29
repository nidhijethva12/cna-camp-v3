import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexable ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] } : { userAgent: "*", disallow: "/" },
    ...(isIndexable ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
  };
}
