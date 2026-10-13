import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const baseCsp = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http://")
    ? ["upgrade-insecure-requests"]
    : []),
];

const blobStorage = "https://*.public.blob.vercel-storage.com";

// Public pages also pin where media may load from. The admin keeps the base policy: its editor and
// direct-to-Blob uploads need more.
const siteCsp = [
  ...baseCsp,
  `img-src 'self' data: blob: ${blobStorage}`,
  `media-src 'self' ${blobStorage}`,
  "font-src 'self'",
  // Google Maps on the contact page; vercel.live is the toolbar on preview deployments.
  "frame-src https://www.google.com https://vercel.live",
];

const csp = (directives: string[]) => ({ key: "Content-Security-Policy", value: directives.join("; ") });

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  csp(baseCsp),
];

const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Sources are already-compressed web images; a high quality avoids visible double-compression.
    formats: ["image/webp"],
    qualities: [90],
    localPatterns: [{ pathname: "/api/media/file/**" }, { pathname: "/img/**" }],
    // Admin-uploaded photos are served from the Vercel Blob CDN.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Some networks (NAT64 DNS) resolve Blob to a 64:ff9b:: address that Next treats as private, which
    // breaks every CMS photo in local development. Production keeps the private-IP protection.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Later rules win for the same header, so this replaces the base policy on public pages only.
      { source: "/", headers: [csp(siteCsp)] },
      { source: "/:path((?!admin|api).*)", headers: [csp(siteCsp)] },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/api/:path*", headers: privateHeaders },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
