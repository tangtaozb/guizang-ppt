"use client";

import { useEffect, useState } from "react";

interface MetricsResponse {
  generatedAt: string;
  users: {
    total: number;
    today: number;
    last7days: number;
    paid: number;
    conversionRate: number;
    planDistribution: Record<string, number>;
    totalCreditsHeld: number;
  };
  revenue: {
    mrrUSD: number;
    byPlan: Record<string, { count: number; mrrUSD: number }>;
  };
  projects: {
    total: number;
    today: number;
    last7days: number;
  };
  credits: {
    totalConsumed: number;
    todayConsumed: number;
    estimatedAPICostUSD: number;
  };
  trend: { date: string; newUsers: number; newProjects: number }[];
}

type ServiceStatus = "ok" | "missing_env" | "error";

interface IntegrationsResponse {
  generatedAt: string;
  vercel: { analytics: string; speedInsights: string; logs: string };
  umami: {
    status: ServiceStatus;
    message?: string;
    data?: {
      pageviews: number;
      visitors: number;
      visits: number;
      bounces: number;
      totaltime: number;
      topPages: { url: string; pageviews: number }[];
      topReferrers: { referrer: string; visitors: number }[];
      dashboardUrl: string;
    };
  };
  sentry: {
    status: ServiceStatus;
    message?: string;
    data?: {
      errorsLast24h: number;
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
    };
  };
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1.5">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function StatusPill({ status, msg }: { status?: ServiceStatus; msg?: string }) {
  if (status === "ok") return null;
  if (status === "missing_env") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-[13px] text-amber-900">
        <div className="font-semibold mb-1">未配置 · 待接入</div>
        <div className="text-amber-800 font-mono text-[11.5px]">{msg}</div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-[13px] text-red-900">
        <div className="font-semibold mb-1">API 调用失败</div>
        <div className="text-red-800 font-mono text-[11.5px] break-all">{msg}</div>
      </div>
    );
  }
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 text-[13px] text-zinc-500">
      加载中…
    </div>
  );
}

function UmamiPanel({ umami }: { umami?: IntegrationsResponse["umami"] }) {
  if (!umami || umami.status !== "ok" || !umami.data)
    return <StatusPill status={umami?.status} msg={umami?.message} />;
  const d = umami.data;
  const bounceRate = d.visits > 0 ? ((d.bounces / d.visits) * 100).toFixed(1) : "0";
  const avgTime =
    d.visits > 0 ? `${Math.round(d.totaltime / d.visits)}s` : "0s";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="PV (页面浏览)" value={d.pageviews.toLocaleString()} />
        <Stat label="UV (独立访客)" value={d.visitors.toLocaleString()} />
        <Stat label="跳出率" value={`${bounceRate}%`} />
        <Stat label="平均停留" value={avgTime} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2.5">
            Top 页面
          </div>
          <ul className="space-y-1.5">
            {d.topPages.length === 0 && (
              <li className="text-[12px] text-zinc-400">— 暂无数据 —</li>
            )}
            {d.topPages.map((p) => (
              <li
                key={p.url}
                className="flex items-baseline justify-between gap-3 text-[13px]"
              >
                <span className="font-mono truncate text-zinc-700">{p.url}</span>
                <span className="tabular-nums text-zinc-500">{p.pageviews}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2.5">
            Top 来源
          </div>
          <ul className="space-y-1.5">
            {d.topReferrers.length === 0 && (
              <li className="text-[12px] text-zinc-400">— 暂无数据 —</li>
            )}
            {d.topReferrers.map((r) => (
              <li
                key={r.referrer}
                className="flex items-baseline justify-between gap-3 text-[13px]"
              >
                <span className="font-mono truncate text-zinc-700">
                  {r.referrer}
                </span>
                <span className="tabular-nums text-zinc-500">{r.visitors}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <a
        href={d.dashboardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-[11px] font-mono text-zinc-400 hover:text-zinc-600 underline"
      >
        → Umami 完整看板
      </a>
    </div>
  );
}

function SentryPanel({ sentry }: { sentry?: IntegrationsResponse["sentry"] }) {
  if (!sentry || sentry.status !== "ok" || !sentry.data)
    return <StatusPill status={sentry?.status} msg={sentry?.message} />;
  const d = sentry.data;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat
          label="24h 异常事件"
          value={d.errorsLast24h.toLocaleString()}
          sub={d.errorsLast24h === 0 ? "无报错 ✓" : "需关注"}
        />
        <Stat label="未解决 Issue" value={d.recentIssues.length} sub="最近 5 个" />
        <Stat
          label="受影响用户"
          value={d.recentIssues.reduce((a, i) => a + i.userCount, 0)}
        />
      </div>
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2.5">
          最近未解决 Issues
        </div>
        {d.recentIssues.length === 0 ? (
          <div className="text-[12px] text-zinc-400">— 暂无 issue —</div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {d.recentIssues.map((i) => (
              <li key={i.id} className="py-2.5 first:pt-0 last:pb-0">
                <a
                  href={i.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="text-[13.5px] font-medium text-zinc-900 group-hover:text-blue-600 truncate">
                    {i.title}
                  </div>
                  {i.culprit && (
                    <div className="text-[11.5px] font-mono text-zinc-500 truncate mt-0.5">
                      {i.culprit}
                    </div>
                  )}
                  <div className="flex gap-3 mt-1 text-[11px] font-mono text-zinc-400">
                    <span>events: {i.count}</span>
                    <span>users: {i.userCount}</span>
                    <span>
                      last: {new Date(i.lastSeen).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <a
        href={d.dashboardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-[11px] font-mono text-zinc-400 hover:text-zinc-600 underline"
      >
        → Sentry 完整看板
      </a>
    </div>
  );
}

function ExternalLinksPanel({
  links,
}: {
  links?: IntegrationsResponse["vercel"];
}) {
  const items = [
    {
      label: "Vercel Analytics",
      desc: "PV / UV / 国家 / 设备 / 浏览器 · Vercel 自家面板",
      href: links?.analytics,
    },
    {
      label: "Speed Insights",
      desc: "Core Web Vitals (LCP / FID / CLS) · 影响 Google 排名",
      href: links?.speedInsights,
    },
    {
      label: "Runtime Logs",
      desc: "Vercel 实时函数日志 · debug 利器",
      href: links?.logs,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
        >
          <div className="text-[14px] font-semibold mb-1.5">{it.label} →</div>
          <div className="text-[12px] text-zinc-500 leading-snug">{it.desc}</div>
        </a>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: { date: string; newUsers: number; newProjects: number }[] }) {
  const maxUsers = Math.max(1, ...data.map((d) => d.newUsers));
  const maxProjects = Math.max(1, ...data.map((d) => d.newProjects));
  const cellW = 100 / data.length;
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span className="text-zinc-700">新增用户</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-zinc-700">新增项目</span>
        </div>
      </div>
      <svg viewBox="0 0 100 30" className="w-full h-32" preserveAspectRatio="none">
        {data.map((d, i) => {
          const x = i * cellW;
          const uH = (d.newUsers / maxUsers) * 14;
          const pH = (d.newProjects / maxProjects) * 14;
          const barW = cellW * 0.35;
          const gap = cellW * 0.1;
          return (
            <g key={d.date}>
              <rect
                x={x + gap}
                y={15 - uH}
                width={barW}
                height={uH || 0.1}
                fill="#3b82f6"
                opacity="0.85"
              >
                <title>{`${d.date}：新增用户 ${d.newUsers}`}</title>
              </rect>
              <rect
                x={x + gap + barW + 0.5}
                y={29 - pH}
                width={barW}
                height={pH || 0.1}
                fill="#f59e0b"
                opacity="0.85"
              >
                <title>{`${d.date}：新增项目 ${d.newProjects}`}</title>
              </rect>
            </g>
          );
        })}
        {/* center axis line */}
        <line x1="0" y1="15" x2="100" y2="15" stroke="#e4e4e7" strokeWidth="0.15" />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-mono text-zinc-400">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export default function AdminMetricsPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [coreRes, intRes] = await Promise.all([
        fetch("/api/admin/metrics", { cache: "no-store" }),
        fetch("/api/admin/metrics/integrations", { cache: "no-store" }),
      ]);
      if (coreRes.status === 401) {
        window.location.href = "/login?next=/admin/metrics";
        return;
      }
      if (coreRes.status === 403) {
        setErr("Forbidden — your account is not in ADMIN_EMAILS allowlist.");
        setLoading(false);
        return;
      }
      const coreJson = await coreRes.json();
      if (!coreRes.ok) throw new Error(coreJson.error || "请求失败");
      setData(coreJson);
      if (intRes.ok) setIntegrations(await intRes.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-sm text-zinc-500">
        加载中…
      </div>
    );
  }

  if (err) {
    const isForbidden = err.includes("Forbidden") || err.includes("not in ADMIN_EMAILS");
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md">
          <div className="text-sm font-semibold text-red-600 mb-2">出错</div>
          <div className="text-sm text-zinc-700">
            {isForbidden ? "禁止访问 — 当前账号不在管理员白名单中" : err}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const ts = new Date(data.generatedAt).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">数据看板</h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              {ts} 北京时间 · 不自动刷新 · 仅内部使用
            </p>
          </div>
          <button
            onClick={load}
            className="h-9 px-3 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700"
          >
            刷新
          </button>
        </header>

        {/* Users */}
        <Section title="用户">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="累计用户" value={data.users.total} sub={`今日 +${data.users.today} · 近 7 天 +${data.users.last7days}`} />
            <Stat label="付费用户" value={data.users.paid} sub={`付费转化率 ${data.users.conversionRate}%`} />
            <Stat label="免费用户" value={data.users.planDistribution.free || 0} />
            <Stat label="积分总持仓" value={data.users.totalCreditsHeld.toLocaleString()} sub="全部用户合计" />
          </div>
        </Section>

        {/* Revenue */}
        <Section title="营收（MRR 估算）">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="月度循环收入"
              value={`$${data.revenue.mrrUSD.toFixed(2)}`}
              sub={`年化 ≈ $${(data.revenue.mrrUSD * 12).toFixed(2)}`}
            />
            <Stat
              label="入门版 Starter（$9.9）"
              value={data.revenue.byPlan.starter?.count || 0}
              sub={`$${(data.revenue.byPlan.starter?.mrrUSD || 0).toFixed(2)} / 月`}
            />
            <Stat
              label="专业版 Pro（$19.9）"
              value={data.revenue.byPlan.pro?.count || 0}
              sub={`$${(data.revenue.byPlan.pro?.mrrUSD || 0).toFixed(2)} / 月`}
            />
            <Stat
              label="旗舰版 Ultra（$49.9）"
              value={data.revenue.byPlan.ultra?.count || 0}
              sub={`$${(data.revenue.byPlan.ultra?.mrrUSD || 0).toFixed(2)} / 月`}
            />
          </div>
        </Section>

        {/* Projects */}
        <Section title="项目">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="累计项目数" value={data.projects.total} />
            <Stat label="今日新增" value={data.projects.today} />
            <Stat label="近 7 天新增" value={data.projects.last7days} />
          </div>
        </Section>

        {/* Credits & cost */}
        <Section title="积分与 API 成本">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat
              label="累计积分消耗"
              value={data.credits.totalConsumed.toLocaleString()}
              sub={`今日消耗 ${data.credits.todayConsumed.toLocaleString()}`}
            />
            <Stat
              label="API 成本估算"
              value={`$${data.credits.estimatedAPICostUSD.toFixed(2)}`}
              sub="按 $0.001 / 积分计算"
            />
            <Stat
              label="毛利率估算"
              value={
                data.revenue.mrrUSD > 0
                  ? `${(
                      ((data.revenue.mrrUSD - data.credits.estimatedAPICostUSD) /
                        data.revenue.mrrUSD) *
                      100
                    ).toFixed(1)}%`
                  : "—"
              }
              sub="（MRR − API 成本）/ MRR"
            />
          </div>
        </Section>

        {/* Trend */}
        <Section title="近 30 天趋势">
          <TrendChart data={data.trend} />
        </Section>

        {/* Web 流量（Umami） */}
        <Section title="Web 流量 · 近 24h (Umami)">
          <UmamiPanel umami={integrations?.umami} />
        </Section>

        {/* 错误监控（Sentry） */}
        <Section title="错误监控 · 近 24h (Sentry)">
          <SentryPanel sentry={integrations?.sentry} />
        </Section>

        {/* Vercel 外部看板入口（无公开 API） */}
        <Section title="Vercel 看板（外链）">
          <ExternalLinksPanel links={integrations?.vercel} />
        </Section>

        <footer className="mt-12 pt-6 border-t border-zinc-200 text-[11px] font-mono text-zinc-400 space-y-1">
          <div>
            内置业务指标 = 本服务 /api/admin/metrics（Supabase 聚合）
          </div>
          <div>
            外部指标 = Umami（流量 / 来源） · Sentry（错误） · Vercel
            Dashboard（Web Vitals / 流量 / 日志）
          </div>
        </footer>
      </div>
    </div>
  );
}
