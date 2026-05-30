import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // officeparser parses PDFs via pdfjs-dist/legacy. Next's static file tracing
  // only catches the pdf.mjs entry, NOT the sibling pdf.worker.mjs it loads at
  // runtime — so on Vercel the worker is missing and every PDF parse fails
  // (docx/pptx don't need pdfjs, hence they worked). Force the whole pdfjs build
  // dir into this route's serverless function.
  outputFileTracingIncludes: {
    "/api/upload/extract": ["./node_modules/pdfjs-dist/legacy/build/**"],
  },
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
