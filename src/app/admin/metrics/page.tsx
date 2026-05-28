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
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login?next=/admin/metrics";
        return;
      }
      if (res.status === 403) {
        setErr("Forbidden — your account is not in ADMIN_EMAILS allowlist.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "请求失败");
      setData(json);
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

        <footer className="mt-12 pt-6 border-t border-zinc-200 text-[11px] font-mono text-zinc-400">
          页面访问量（PV / UV）请前往{" "}
          <a
            href="https://vercel.com/taotang851-3495s-projects/guizang-ppt/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-600"
          >
            Vercel Analytics
          </a>{" "}
          查看（独立看板）
        </footer>
      </div>
    </div>
  );
}
