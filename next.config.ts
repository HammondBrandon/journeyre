import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The RETS photo proxy serves images from /api/listings/[id]/photos —
  // those are first-party API routes, so no remotePatterns needed.
  // If you ever switch to direct RETS CDN URLs, add them here:
  // images: { remotePatterns: [{ hostname: "gamls-rets.connectmls.com" }] },
};

export default nextConfig;
