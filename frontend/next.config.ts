import path from "path";
import type { NextConfig } from "next";

// Content Security Policy: only this site's own scripts, the Google Maps iframe
// and https images (admin-provided URLs). 'unsafe-inline' is required by Next's
// inline hydration scripts and the theme script in layout.tsx.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self'",
  // The HEIC converter (heic-to) decodes in a worker created from a blob: URL
  "worker-src 'self' blob:",
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Dev mode needs eval for hot reload: the CSP only applies in production
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  // Monorepo with one lockfile per package: pin the root to this app,
  // otherwise Turbopack picks the parent folder and next/font fails to resolve.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Server-only libraries used by the API routes (app/api/*)
  serverExternalPackages: ["nodemailer"],
  images: {
    // Resized and converted to WebP on demand. Other URLs typed in the admin
    // are rendered unoptimized (see imageProps in lib/api.ts).
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Uploaded images never change (unique filenames): keep optimized copies 31 days
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
