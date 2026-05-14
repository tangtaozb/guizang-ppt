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

// ── Intent Recognition ──

const EDIT_PATTERNS = /^(换成|改为|改成|加上|添加|删除|删掉|去掉|移除|修改|增加|减少|调整|替换|更换|缩小|放大|加粗|加一|减一|移到|挪到|设为|设置|把.{1,10}(改|换|变|调|设|删|加|去|移)|每.{0,4}(页|张|slide)|重新生成|字体|颜色|背景|标题|正文|页眉|页脚|间距|边距|对齐|居中|靠左|靠右|主题|风格|布局|排版|动画)/;

const CHAT_PATTERNS = /^(这个|请问|为什么|怎么|什么|是否|有没有|是不是|能不能|可以吗|多少|几个|几页|哪个|哪些|介绍|解释|说明|你觉得|你认为|建议|帮我看|帮我想|分析|评价|好不好|对吗|行吗)/;

export type Intent = "edit" | "chat";

export function classifyIntent(message: string): Intent {
  const trimmed = message.trim();

  // Questions ending with ? are usually chat
  if (trimmed.endsWith("？") || trimmed.endsWith("?")) {
    // Unless it's a rhetorical instruction like "能不能换个颜色？"
    if (EDIT_PATTERNS.test(trimmed)) return "edit";
    return "chat";
  }

  // Explicit edit patterns
  if (EDIT_PATTERNS.test(trimmed)) return "edit";

  // Explicit chat patterns
  if (CHAT_PATTERNS.test(trimmed)) return "chat";

  // Default: treat as edit instruction (primary use case)
  return "edit";
}
