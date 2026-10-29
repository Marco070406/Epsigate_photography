import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo with one lockfile per package: pin the root to this app,
  // otherwise Turbopack picks the parent folder and next/font fails to resolve.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        // Backend local (dev)
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        // Backend distant (prod) — remplace par ton vrai domaine backend
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/uploads/**",
      },
      {
        // Ou autre hébergeur backend custom
        protocol: "https",
        hostname: "*.render.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
