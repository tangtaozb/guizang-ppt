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
  style: ThemeStyle;
  ink: string;
  paper: string;
  accent?: string;
  accentOn?: string;
}

export const THEMES_A: Theme[] = [
  { id: "ink-classic", name: "墨韵经典", nameEn: "Monocle", style: "a", ink: "#0a0a0b", paper: "#f1efea" },
  { id: "indigo", name: "靛蓝瓷", nameEn: "Indigo Porcelain", style: "a", ink: "#0a1f3d", paper: "#f1f3f5" },
  { id: "forest", name: "森林墨", nameEn: "Forest Ink", style: "a", ink: "#1a2e1f", paper: "#f5f1e8" },
  { id: "kraft", name: "牛皮纸", nameEn: "Kraft Paper", style: "a", ink: "#2a1e13", paper: "#eedfc7" },
  { id: "dune", name: "沙丘", nameEn: "Dune", style: "a", ink: "#1f1a14", paper: "#f0e6d2" },
];

export const THEMES_B: Theme[] = [
  { id: "ikb", name: "克莱因蓝", nameEn: "IKB", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#002FA7", accentOn: "#ffffff" },
  { id: "lemon", name: "柠檬黄", nameEn: "Lemon", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#FFD500", accentOn: "#0a0a0a" },
  { id: "lemon-green", name: "柠檬绿", nameEn: "Lemon Green", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#C5E803", accentOn: "#0a0a0a" },
  { id: "safety-orange", name: "安全橙", nameEn: "Safety Orange", style: "b", ink: "#0a0a0a", paper: "#fafaf8", accent: "#FF6B35", accentOn: "#ffffff" },
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
