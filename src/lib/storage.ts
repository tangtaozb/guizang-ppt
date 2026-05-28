import type { StoredProject, ProjectVersion, ChatMessage, UserProfile, CreditRecord, ThemeId } from "@/types";

const PROJECTS_KEY = "artifyslide_projects";
const USER_KEY = "artifyslide_user";

function genId(): string {
  return crypto.randomUUID();
}

// ── Projects ──

export function getProjects(): StoredProject[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredProject[];
  } catch {
    return [];
  }
}

function saveProjects(projects: StoredProject[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProject(id: string): StoredProject | null {
  return getProjects().find((p) => p.id === id) || null;
}

export function createProject(data: {
  title: string;
  theme: ThemeId;
  sourceText: string;
}): StoredProject {
  const now = new Date().toISOString();
  const project: StoredProject = {
    id: genId(),
    title: data.title,
    theme: data.theme,
    sourceText: data.sourceText,
    currentHtml: "",
    versions: [],
    messages: [],
    slideCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const projects = getProjects();
  projects.unshift(project);
  saveProjects(projects);
  return project;
}

export function updateProject(id: string, patch: Partial<StoredProject>) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return;
  projects[idx] = { ...projects[idx], ...patch, updatedAt: new Date().toISOString() };
  saveProjects(projects);
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function addVersion(projectId: string, html: string, label: string): ProjectVersion {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) throw new Error("Project not found");
  const version: ProjectVersion = {
    id: genId(),
    html,
    label,
    createdAt: new Date().toISOString(),
  };
  projects[idx].versions.push(version);
  projects[idx].currentHtml = html;
  projects[idx].updatedAt = version.createdAt;
  saveProjects(projects);
  return version;
}

export function countSlides(html: string): number {
  if (typeof window === "undefined") return 0;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.querySelectorAll(".slide").length;
}

export function saveMessages(projectId: string, messages: ChatMessage[]) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return;
  projects[idx].messages = messages;
  saveProjects(projects);
}

// ── User Profile ──

// Legacy localStorage fallback (real users are managed in Supabase).
// New users start with 0 credits — must subscribe to use the product.
const DEFAULT_USER: UserProfile = {
  id: "local-user",
  phone: "138****0000",
  nickname: "用户",
  plan: "free",
  credits: 0,
  creditHistory: [],
  createdAt: new Date().toISOString(),
};

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_USER;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return DEFAULT_USER;
  }
}

function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function consumeCredits(amount: number, description: string, projectTitle: string, type: CreditRecord["type"] = "generate") {
  const profile = getUserProfile();
  const record: CreditRecord = {
    id: genId(),
    type,
    amount: -amount,
    description,
    projectTitle,
    createdAt: new Date().toISOString(),
  };
  profile.credits = Math.max(0, profile.credits - amount);
  profile.creditHistory.unshift(record);
  saveUserProfile(profile);
  return profile;
}

export function addCredits(amount: number, description: string) {
  const profile = getUserProfile();
  const record: CreditRecord = {
    id: genId(),
    type: "purchase",
    amount,
    description,
    projectTitle: "",
    createdAt: new Date().toISOString(),
  };
  profile.credits += amount;
  profile.creditHistory.unshift(record);
  saveUserProfile(profile);
  return profile;
}

export function updateUserNickname(nickname: string) {
  const profile = getUserProfile();
  profile.nickname = nickname;
  saveUserProfile(profile);
  return profile;
}
