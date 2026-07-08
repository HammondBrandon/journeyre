import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the X-Powered-By response header.
  poweredByHeader: false,

  images: {
    // Serve AVIF first (smaller than WebP), fall back to WebP.
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 30 days instead of the 60-second default.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
