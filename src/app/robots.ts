import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.artifyslide.com";
// Vercel 自动注入；仅生产部署 === "production"。缺省（预览/staging/本地）按非生产。
const IS_PROD = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  // 非生产部署整站 Disallow —— 否则预览/staging URL 会被当成 artifyslide.com 的重复内容收录。
  if (!IS_PROD) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/editor",
          "/admin",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
