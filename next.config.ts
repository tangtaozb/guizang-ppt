import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // OG / 站点图标长缓存：social crawlers 偏好长 max-age，避免反复重抓
        source: "/:path(og.png|favicon.ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
