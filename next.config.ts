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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS filter
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://api.midtrans.com https://app.sandbox.midtrans.com https://*.supabase.co wss://*.supabase.co; " +
              "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com; " +
              "object-src 'none'; " +
              "base-uri 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
