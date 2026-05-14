export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  theme: ThemeId;
  sourceText: string | null;
  currentHtml: string | null;
  slideCount: number;
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: "user" | "assistant";
  content: string;
  tokensUsed: number;
  createdAt: string;
}

export type ThemeId =
  | "ink-classic"
  | "indigo"
  | "forest"
  | "kraft"
  | "dune"
  | "ikb"
  | "lemon"
  | "lemon-green"
  | "safety-orange";

export type ThemeStyle = "a" | "b";

export interface Theme {
  id: ThemeId;
  name: string;
  nameEn: string;
  desc: string;
  style: ThemeStyle;
  ink: string;
  paper: string;
  accent?: string;
  accentOn?: string;
}

export const THEMES_A: Theme[] = [
  { id: "ink-classic", name: "墨韵经典", nameEn: "Monocle", desc: "通用场景 · 商业发布 · 科技产品", style: "a", ink: "#0a0a0b", paper: "#f1efea" },
  { id: "indigo", name: "靛蓝瓷", nameEn: "Indigo Porcelain", desc: "科技研究 · 数据报告 · 深度内容", style: "a", ink: "#0a1f3d", paper: "#f1f3f5" },
  { id: "forest", name: "森林墨", nameEn: "Forest Ink", desc: "自然人文 · 可持续 · 品牌故事", style: "a", ink: "#1a2e1f", paper: "#f5f1e8" },
  { id: "kraft", name: "牛皮纸", nameEn: "Kraft Paper", desc: "怀旧文学 · 独立杂志 · 手作品牌", style: "a", ink: "#2a1e13", paper: "#eedfc7" },
  { id: "dune", name: "沙丘", nameEn: "Dune", desc: "艺术设计 · 时尚创意 · 画廊手册", style: "a", ink: "#1f1a14", paper: "#f0e6d2" },
];

export const THEMES_B: Theme[] = [
  { id: "ikb", name: "蓝调宣言", nameEn: "IKB", desc: "商业提案 · 品牌发布 · 艺术展览", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#002FA7", accentOn: "#ffffff" },
  { id: "lemon", name: "日光信号", nameEn: "Lemon", desc: "创业路演 · 产品发布 · 年轻品牌", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#FFD500", accentOn: "#0a0a0a" },
  { id: "lemon-green", name: "酸柠实验", nameEn: "Lemon Green", desc: "先锋设计 · 潮牌文化 · 实验内容", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#C5E803", accentOn: "#0a0a0a" },
  { id: "safety-orange", name: "暖阳行动", nameEn: "Safety Orange", desc: "营销活动 · 社区运营 · 行动号召", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#FF6B35", accentOn: "#ffffff" },
];

export const THEMES: Theme[] = [...THEMES_A, ...THEMES_B];

export function getThemeStyle(themeId: ThemeId): ThemeStyle {
  return THEMES.find((t) => t.id === themeId)?.style ?? "a";
}

export interface Subscription {
  id: string;
  plan: "per_use" | "monthly" | "yearly";
  status: "active" | "expired";
  tokensRemaining: number;
  expiresAt: string | null;
}

export type PlanInfo = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
};

export interface ProjectVersion {
  id: string;
  html: string;
  label: string;
  createdAt: string;
}

export interface StoredProject {
  id: string;
  title: string;
  theme: ThemeId;
  sourceText: string;
  currentHtml: string;
  versions: ProjectVersion[];
  slideCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditRecord {
  id: string;
  type: "generate" | "edit" | "purchase";
  amount: number;
  description: string;
  projectTitle: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  nickname: string;
  plan: "free" | "per_use" | "monthly" | "yearly";
  credits: number;
  creditHistory: CreditRecord[];
  createdAt: string;
}
