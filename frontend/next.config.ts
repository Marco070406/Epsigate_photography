import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
