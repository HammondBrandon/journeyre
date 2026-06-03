import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the X-Powered-By response header.
  poweredByHeader: false,

  images: {
    // Serve AVIF first (smaller than WebP), fall back to WebP.
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 30 days instead of the 60-second default.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Next.js 16 requires explicit opt-in for local URLs with query strings.
    // The photo proxy at /api/listings/[id]/photos uses ?num=&type= params.
    localPatterns: [
      {
        pathname: "/api/listings/**",
      },
    ],
    // GAMLS listing photos are served directly from the ConnectMLS CDN.
    // The getBatchCoverPhotos helper returns these URLs directly, and the
    // /api/listings/[id]/photos proxy 302-redirects here. Both paths require
    // this entry so next/image can fetch, resize, and convert the source JPEG.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gamls-assets.cdn-connectmls.com",
      },
    ],
  },
};

export default nextConfig;
