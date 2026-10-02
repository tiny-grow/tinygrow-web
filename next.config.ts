import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/tinygrow-favicon.png',
      },
      {
        source: '/favicon.png',
        destination: '/tinygrow-favicon.png',
      },
    ];
  },
};

export default nextConfig;
