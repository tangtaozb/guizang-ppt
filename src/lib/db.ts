// Client-side data service — calls API routes to interact with Supabase
import type { ChatMessage, ThemeId, ProjectVersion, CreditRecord } from "@/types";

export interface DbProject {
  id: string;
  title: string;
  theme: ThemeId;
  sourceText: string;
  currentHtml: string;
  slideCount: number;
  versions: ProjectVersion[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DbProjectListItem {
  id: string;
  title: string;
  theme: ThemeId;
  slideCount: number;
  createdAt: string;
  updatedAt: string;
  hasHtml: boolean;
}

export interface DbUserProfile {
  id: string;
  email: string;
  phone: string;
  nickname: string;
  plan: "free" | "per_use" | "monthly" | "yearly";
  credits: number;
  createdAt: string;
}

export interface DbCreditsPage {
  records: CreditRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  credits: number;
}

// ── Projects ──

export async function dbGetProjects(): Promise<DbProjectListItem[]> {
  const res = await fetch("/api/db/projects");
  if (!res.ok) throw new Error("加载项目列表失败");
  return res.json();
}

export async function dbGetProject(id: string): Promise<DbProject> {
  const res = await fetch(`/api/db/projects/${id}`);
  if (!res.ok) throw new Error("加载项目失败");
  return res.json();
}

export async function dbCreateProject(data: {
  title: string;
  theme: ThemeId;
  sourceText: string;
}): Promise<DbProject> {
  const res = await fetch("/api/db/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("创建项目失败");
  return res.json();
}

export async function dbUpdateProject(
  id: string,
  patch: Partial<{
    title: string;
    theme: string;
    currentHtml: string;
    sourceText: string;
    slideCount: number;
  }>
): Promise<void> {
  const res = await fetch(`/api/db/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("更新项目失败");
}

export async function dbDeleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/db/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("删除项目失败");
}

export async function dbSaveAfterGeneration(
  projectId: string,
  data: {
    html: string;
    label: string;
    messages: { role: string; content: string }[];
    slideCount: number;
  }
): Promise<{ version: ProjectVersion }> {
  const res = await fetch(`/api/db/projects/${projectId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("保存失败");
  return res.json();
}

// ── User ──

export async function dbGetUser(): Promise<DbUserProfile> {
  const res = await fetch("/api/db/user");
  if (!res.ok) throw new Error("加载用户信息失败");
  return res.json();
}

export async function dbUpdateNickname(nickname: string): Promise<DbUserProfile> {
  const res = await fetch("/api/db/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  if (!res.ok) throw new Error("更新昵称失败");
  return res.json();
}

// ── Credits ──

export async function dbGetCredits(page = 0, pageSize = 8): Promise<DbCreditsPage> {
  const res = await fetch(`/api/db/credits?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error("加载积分记录失败");
  return res.json();
}

export async function dbConsumeCredits(data: {
  amount: number;
  description: string;
  projectTitle: string;
  type: "generate" | "edit";
}): Promise<{ credits: number }> {
  const res = await fetch("/api/db/credits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("扣费失败");
  return res.json();
}

// Intent recognition has been moved to src/lib/agent.ts (Agent routing module)
