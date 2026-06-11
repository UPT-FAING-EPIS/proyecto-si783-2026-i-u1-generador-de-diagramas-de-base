import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
