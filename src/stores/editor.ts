import { create } from "zustand";
import type { ChatMessage, ThemeId } from "@/types";

interface EditorStore {
  projectId: string | null;
  projectTitle: string;
  currentHtml: string;
  messages: ChatMessage[];
  isGenerating: boolean;
  theme: ThemeId;
  slideCount: number;
  sourceText: string;

  setProjectId: (id: string) => void;
  setProjectTitle: (title: string) => void;
  setHtml: (html: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setGenerating: (v: boolean) => void;
  setTheme: (theme: ThemeId) => void;
  setSlideCount: (count: number) => void;
  setSourceText: (text: string) => void;
  reset: () => void;
}

const initialState = {
  projectId: null,
  projectTitle: "未命名演示",
  currentHtml: "",
  messages: [],
  isGenerating: false,
  theme: "ink-classic" as ThemeId,
  slideCount: 0,
  sourceText: "",
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialState,

  setProjectId: (id) => set({ projectId: id }),
  setProjectTitle: (title) => set({ projectTitle: title }),
  setHtml: (html) => set({ currentHtml: html }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  updateLastAssistantMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content };
      }
      return { messages: msgs };
    }),
  setGenerating: (v) => set({ isGenerating: v }),
  setTheme: (theme) => set({ theme }),
  setSlideCount: (count) => set({ slideCount: count }),
  setSourceText: (text) => set({ sourceText: text }),
  reset: () => set(initialState),
}));
