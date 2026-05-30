// Sentry browser-side initialization.
// 仅当 NEXT_PUBLIC_SENTRY_DSN 设置时启用，未设置时所有调用变 no-op。

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
    tracesSampleRate: 0.1, // 10% 性能采样，避免吃满免费 quota
    replaysSessionSampleRate: 0, // 关闭 session replay（流量大、隐私敏感）
    replaysOnErrorSampleRate: 1.0, // 报错时录制（debug 利器）
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // 过滤掉显然不重要的浏览器噪音
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  });
}
