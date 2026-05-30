// GET /api/admin/metrics/integrations
// 聚合外部服务监控数据（Umami / Sentry），admin-only。
// 每个服务独立 try/catch —— 任意一个挂掉不影响其他面板。

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Types
// ============================================================
type Status = "ok" | "missing_env" | "error";

interface ServiceResult<T> {
  status: Status;
  message?: string;
  data?: T;
}

interface UmamiStats {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  topPages: { url: string; pageviews: number }[];
  topReferrers: { referrer: string; visitors: number }[];
  // 链接到 Umami 自家 dashboard
  dashboardUrl: string;
}

interface SentryStats {
  // 24h 新事件数
  errorsLast24h: number;
  // 最近 5 个未解决 issue
  recentIssues: {
    id: string;
    title: string;
    culprit: string;
    count: number;
    userCount: number;
    lastSeen: string;
    permalink: string;
  }[];
  dashboardUrl: string;
}

// ============================================================
// Umami fetch
// ============================================================
async function fetchUmami(): Promise<ServiceResult<UmamiStats>> {
  const websiteId = process.env.UMAMI_WEBSITE_ID;
  const apiKey = process.env.UMAMI_API_KEY;
  const apiHost = process.env.UMAMI_API_HOST || "https://api.umami.is/v1";

  if (!websiteId || !apiKey) {
    return {
      status: "missing_env",
      message: "未配置 UMAMI_WEBSITE_ID 或 UMAMI_API_KEY",
    };
  }

  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const qs = `startAt=${dayAgo}&endAt=${now}`;
  const headers = {
    "x-umami-api-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    const [statsRes, pagesRes, refsRes] = await Promise.all([
      fetch(`${apiHost}/websites/${websiteId}/stats?${qs}`, { headers, cache: "no-store" }),
      fetch(
        `${apiHost}/websites/${websiteId}/metrics?${qs}&type=url&limit=8`,
        { headers, cache: "no-store" }
      ),
      fetch(
        `${apiHost}/websites/${websiteId}/metrics?${qs}&type=referrer&limit=8`,
        { headers, cache: "no-store" }
      ),
    ]);

    if (!statsRes.ok) {
      return {
        status: "error",
        message: `Umami stats ${statsRes.status}: ${await statsRes.text()}`,
      };
    }

    type StatNum = { value: number } | number;
    const stats = (await statsRes.json()) as {
      pageviews: StatNum;
      visitors: StatNum;
      visits: StatNum;
      bounces: StatNum;
      totaltime: StatNum;
    };
    const num = (v: StatNum) => (typeof v === "number" ? v : v.value);

    const topPages = pagesRes.ok
      ? ((await pagesRes.json()) as { x: string; y: number }[]).map((r) => ({
          url: r.x,
          pageviews: r.y,
        }))
      : [];

    const topReferrers = refsRes.ok
      ? ((await refsRes.json()) as { x: string; y: number }[]).map((r) => ({
          referrer: r.x || "(direct)",
          visitors: r.y,
        }))
      : [];

    return {
      status: "ok",
      data: {
        pageviews: num(stats.pageviews),
        visitors: num(stats.visitors),
        visits: num(stats.visits),
        bounces: num(stats.bounces),
        totaltime: num(stats.totaltime),
        topPages,
        topReferrers,
        dashboardUrl: process.env.UMAMI_DASHBOARD_URL || "https://cloud.umami.is",
      },
    };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

// ============================================================
// Sentry fetch
// ============================================================
async function fetchSentry(): Promise<ServiceResult<SentryStats>> {
  const token = process.env.SENTRY_API_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;

  if (!token || !org || !project) {
    return {
      status: "missing_env",
      message: "未配置 SENTRY_API_TOKEN / SENTRY_ORG / SENTRY_PROJECT",
    };
  }

  const headers = { Authorization: `Bearer ${token}` };
  const sentryHost = process.env.SENTRY_HOST || "https://sentry.io";

  try {
    // 1) 24h 事件数：projects/{org}/{project}/stats/
    const since = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    const statsUrl = `${sentryHost}/api/0/projects/${org}/${project}/stats/?stat=received&since=${since}&resolution=1h`;
    const statsRes = await fetch(statsUrl, { headers, cache: "no-store" });

    let errorsLast24h = 0;
    if (statsRes.ok) {
      // 返回 [[timestamp, count], ...]
      const points = (await statsRes.json()) as [number, number][];
      errorsLast24h = points.reduce((a, [, c]) => a + c, 0);
    }

    // 2) 最近未解决 issues
    const issuesUrl = `${sentryHost}/api/0/projects/${org}/${project}/issues/?query=is:unresolved&limit=5&sort=created`;
    const issuesRes = await fetch(issuesUrl, { headers, cache: "no-store" });

    type SentryIssue = {
      id: string;
      title: string;
      culprit?: string;
      count: string | number;
      userCount: number;
      lastSeen: string;
      permalink: string;
    };
    let recentIssues: SentryStats["recentIssues"] = [];
    if (issuesRes.ok) {
      const issues = (await issuesRes.json()) as SentryIssue[];
      recentIssues = issues.map((i) => ({
        id: i.id,
        title: i.title,
        culprit: i.culprit ?? "",
        count: typeof i.count === "string" ? parseInt(i.count, 10) : i.count,
        userCount: i.userCount,
        lastSeen: i.lastSeen,
        permalink: i.permalink,
      }));
    }

    return {
      status: "ok",
      data: {
        errorsLast24h,
        recentIssues,
        dashboardUrl: `${sentryHost}/organizations/${org}/projects/${project}/`,
      },
    };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

// ============================================================
// Vercel deep-link (no API — Vercel Analytics has no public read API)
// ============================================================
function getVercelLinks() {
  // 这些 URL 都需要登录 Vercel 才能看；只是为 dashboard 加快捷入口
  const team = "taotang851-3495s-projects";
  const project = "guizang-ppt";
  const base = `https://vercel.com/${team}/${project}`;
  return {
    analytics: `${base}/analytics`,
    speedInsights: `${base}/speed-insights`,
    logs: `${base}/logs`,
  };
}

// ============================================================
// Handler
// ============================================================
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminEmail(user.email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [umami, sentry] = await Promise.all([fetchUmami(), fetchSentry()]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    vercel: getVercelLinks(),
    umami,
    sentry,
  });
}
