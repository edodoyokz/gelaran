import { getServerEnv } from "./lib/env";
import type { NextConfig } from "next";

getServerEnv();

const skipNextTypecheck = process.env.CI_BUILD_SKIP_NEXT_TYPECHECK === "true";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: skipNextTypecheck,
  },
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
