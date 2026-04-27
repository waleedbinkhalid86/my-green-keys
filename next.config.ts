import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  // Vercel-specific optimizations
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  poweredByHeader: false,
  compress: true,
  // Ensure proper static generation
  staticPageGenerationTimeout: 60,
};

export default nextConfig;
