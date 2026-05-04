import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@fluxsql/backend'],
  serverExternalPackages: ['postgres']
};

export default nextConfig;
