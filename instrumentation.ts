// Next.js 16 instrumentation entry — 启动时按 runtime 装载 Sentry 配置。
// 见 https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// 捕获 RSC / Server Action 抛出的错误
export const onRequestError = async (...args: unknown[]) => {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import("@sentry/nextjs");
  // @ts-expect-error - Sentry types lag the Next signature
  return Sentry.captureRequestError(...args);
};
