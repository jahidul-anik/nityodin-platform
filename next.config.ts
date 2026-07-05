import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles its own output optimization
  // "standalone" is fine for Docker/self-hosted deployments too
  output: "standalone",

  // Enable for production to catch type errors during CI
  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,
};

export default nextConfig;