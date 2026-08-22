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
        // Backend distant (prod) — remplace par ton vrai domaine
        protocol: "https",
        hostname: "*.epsigate-photography.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
