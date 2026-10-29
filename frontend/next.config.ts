import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo with one lockfile per package: pin the root to this app,
  // otherwise Turbopack picks the parent folder and next/font fails to resolve.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Server-only libraries used by the API routes (app/api/*)
  serverExternalPackages: ["nodemailer"],
  images: {
    // Images come from /public, /uploads (local) or Vercel Blob
    unoptimized: true,
  },
};

export default nextConfig;
