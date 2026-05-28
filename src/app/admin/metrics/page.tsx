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
          <span className="text-zinc-700">New users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-zinc-700">New projects</span>
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
                <title>{`${d.date}: ${d.newUsers} users`}</title>
              </rect>
              <rect
                x={x + gap + barW + 0.5}
                y={29 - pH}
                width={barW}
                height={pH || 0.1}
                fill="#f59e0b"
                opacity="0.85"
              >
                <title>{`${d.date}: ${d.newProjects} projects`}</title>
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
      if (!res.ok) throw new Error(json.error || "Request failed");
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
        Loading metrics…
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md">
          <div className="text-sm font-semibold text-red-600 mb-2">Error</div>
          <div className="text-sm text-zinc-700">{err}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const ts = new Date(data.generatedAt).toLocaleString("en-US", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Metrics</h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              {ts} CST · auto-refresh disabled · internal only
            </p>
          </div>
          <button
            onClick={load}
            className="h-9 px-3 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700"
          >
            Refresh
          </button>
        </header>

        {/* Users */}
        <Section title="Users">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total users" value={data.users.total} sub={`+${data.users.today} today · +${data.users.last7days} this week`} />
            <Stat label="Paid users" value={data.users.paid} sub={`${data.users.conversionRate}% conversion`} />
            <Stat label="Free" value={data.users.planDistribution.free || 0} />
            <Stat label="Credits held" value={data.users.totalCreditsHeld.toLocaleString()} sub="across all users" />
          </div>
        </Section>

        {/* Revenue */}
        <Section title="Revenue (MRR estimate)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="MRR"
              value={`$${data.revenue.mrrUSD.toFixed(2)}`}
              sub={`ARR ≈ $${(data.revenue.mrrUSD * 12).toFixed(2)}`}
            />
            <Stat
              label="Starter ($9.9)"
              value={data.revenue.byPlan.starter?.count || 0}
              sub={`$${(data.revenue.byPlan.starter?.mrrUSD || 0).toFixed(2)}/mo`}
            />
            <Stat
              label="Pro ($19.9)"
              value={data.revenue.byPlan.pro?.count || 0}
              sub={`$${(data.revenue.byPlan.pro?.mrrUSD || 0).toFixed(2)}/mo`}
            />
            <Stat
              label="Ultra ($49.9)"
              value={data.revenue.byPlan.ultra?.count || 0}
              sub={`$${(data.revenue.byPlan.ultra?.mrrUSD || 0).toFixed(2)}/mo`}
            />
          </div>
        </Section>

        {/* Projects */}
        <Section title="Projects">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Total decks" value={data.projects.total} />
            <Stat label="Today" value={data.projects.today} />
            <Stat label="Last 7 days" value={data.projects.last7days} />
          </div>
        </Section>

        {/* Credits & cost */}
        <Section title="Credits & API cost">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat
              label="Credits consumed"
              value={data.credits.totalConsumed.toLocaleString()}
              sub={`${data.credits.todayConsumed.toLocaleString()} today`}
            />
            <Stat
              label="Est. API cost"
              value={`$${data.credits.estimatedAPICostUSD.toFixed(2)}`}
              sub="@ $0.001/credit"
            />
            <Stat
              label="Est. gross margin"
              value={
                data.revenue.mrrUSD > 0
                  ? `${(
                      ((data.revenue.mrrUSD - data.credits.estimatedAPICostUSD) /
                        data.revenue.mrrUSD) *
                      100
                    ).toFixed(1)}%`
                  : "—"
              }
              sub="(MRR - API cost) / MRR"
            />
          </div>
        </Section>

        {/* Trend */}
        <Section title="30-day trend">
          <TrendChart data={data.trend} />
        </Section>

        <footer className="mt-12 pt-6 border-t border-zinc-200 text-[11px] font-mono text-zinc-400">
          Page view stats (PV / UV) live in{" "}
          <a
            href="https://vercel.com/taotang851-3495s-projects/guizang-ppt/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-600"
          >
            Vercel Analytics
          </a>{" "}
          (separate dashboard).
        </footer>
      </div>
    </div>
  );
}
