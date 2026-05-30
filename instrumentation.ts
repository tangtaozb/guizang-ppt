// Next.js 16 instrumentation entry — 启动时按 runtime 装载 Sentry 配置。
// 见 https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Install pdfjs browser-global stubs at cold-start, then EAGERLY evaluate the
    // pdfjs module while the stubs are in scope. pdfjs references DOMMatrix/etc.
    // at module-eval time; doing the first import here (after the polyfill) means
    // that eval succeeds and the module is cached, so the route's later import()
    // reuses the already-evaluated module. Fixes "DOMMatrix is not defined".
    const { installPdfGlobals } = await import("./src/lib/pdf-globals");
    installPdfGlobals();
    try {
      await import("pdfjs-dist/legacy/build/pdf.mjs");
    } catch {
      // Non-fatal: the route-level defensive polyfill + import will retry.
    }
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
