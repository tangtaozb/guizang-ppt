import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // officeparser dynamically imports pdfjs-dist/legacy at runtime. Mark them
  // external so the whole package (incl. pdfjs + its .mjs assets) ships into
  // the serverless function instead of being bundled/tree-shaken — the dynamic
  // import() otherwise risks resolving to a missing chunk on Vercel.
  serverExternalPackages: ["officeparser", "pdfjs-dist"],
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

// 仅当 SENTRY_AUTH_TOKEN 和 ORG/PROJECT 同时存在才上传 source map（local dev 不会触发）。
const hasSentryUpload =
  !!process.env.SENTRY_AUTH_TOKEN &&
  !!process.env.SENTRY_ORG &&
  !!process.env.SENTRY_PROJECT;

export default hasSentryUpload
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG!,
      project: process.env.SENTRY_PROJECT!,
      authToken: process.env.SENTRY_AUTH_TOKEN!,
      silent: true,
      widenClientFileUpload: true,
      disableLogger: true,
      automaticVercelMonitors: false,
    })
  : nextConfig;
