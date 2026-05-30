"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n";

type FileStatus = "parsing" | "done" | "error";

export interface UploadedFile {
  id: number;
  name: string;
  ext: string; // docx | pptx | pdf | <other>
  size: number; // bytes
  status: FileStatus;
  text: string; // extracted text (done only)
  truncated: boolean;
  error?: string; // human message (error only)
}

const ACCEPT =
  ".docx,.pptx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation";
const MAX_BYTES = 4 * 1024 * 1024;
const VALID_EXTS = ["docx", "pptx", "pdf"];

function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Owns the uploaded-file list + parsing. State is lifted into the parent so the
 * chips (FileChips) and the trigger (FileUploadTrigger) can live in different
 * places in the layout — e.g. chips ABOVE the textarea, trigger in the toolbar.
 *
 * `combinedText` is the merged plain text of all parsed files; the parent merges
 * it with any manually-typed text at generate time.
 */
export function useFileUploads(disabled?: boolean) {
  const { t } = useTranslation();
  const idRef = useRef(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const parseFile = useCallback(
    async (id: number, file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/extract", {
          method: "POST",
          body: formData,
        });
        const json = await res.json().catch(() => ({}));
        setFiles((prev) =>
          prev.map((f): UploadedFile => {
            if (f.id !== id) return f;
            if (!res.ok) {
              return { ...f, status: "error", error: json.error || t("upload.failed") };
            }
            return {
              ...f,
              status: "done",
              text: json.text || "",
              truncated: !!json.meta?.truncated,
            };
          })
        );
      } catch (e) {
        console.error("[upload] failed:", e);
        setFiles((prev) =>
          prev.map((f): UploadedFile =>
            f.id === id ? { ...f, status: "error", error: t("upload.failed") } : f
          )
        );
      }
    },
    [t]
  );

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      const toParse: { id: number; file: File }[] = [];
      const newEntries: UploadedFile[] = [];
      for (const file of Array.from(fileList)) {
        const ext = extOf(file.name);
        const id = ++idRef.current;
        const base: UploadedFile = {
          id,
          name: file.name,
          ext,
          size: file.size,
          status: "parsing",
          text: "",
          truncated: false,
        };
        if (!VALID_EXTS.includes(ext)) {
          newEntries.push({ ...base, status: "error", error: t("upload.unsupported") });
        } else if (file.size > MAX_BYTES) {
          newEntries.push({ ...base, status: "error", error: t("upload.tooLarge") });
        } else {
          newEntries.push(base);
          toParse.push({ id, file });
        }
      }
      if (newEntries.length === 0) return;
      setFiles((prev) => [...prev, ...newEntries]);
      toParse.forEach(({ id, file }) => parseFile(id, file));
    },
    [disabled, parseFile, t]
  );

  const removeFile = useCallback((id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const combinedText = useMemo(
    () =>
      files
        .filter((f) => f.status === "done" && f.text.trim())
        .map((f) => `【${f.name}】\n${f.text.trim()}`)
        .join("\n\n"),
    [files]
  );

  return { files, addFiles, removeFile, combinedText };
}

/**
 * Horizontal, scrollable row of file cards. Renders nothing when empty.
 * Place this ABOVE the textarea (over the placeholder area).
 *
 * Each card's name is capped at 8em — at the card's font size, 1 CJK glyph ≈ 1em,
 * so 8em ≈ 8 Chinese characters wide; longer names truncate with an ellipsis and
 * reveal the full name on hover (title).
 */
export function FileChips({
  files,
  onRemove,
}: {
  files: UploadedFile[];
  onRemove: (id: number) => void;
}) {
  const { t } = useTranslation();
  if (files.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15">
      {files.map((f) => (
        <div
          key={f.id}
          className={`shrink-0 flex items-center gap-1.5 rounded-lg border py-1 pl-1.5 pr-1 text-xs ${
            f.status === "error"
              ? "border-red-200 bg-red-50/60"
              : "border-border bg-muted/40"
          }`}
        >
          <FormatBadge ext={f.ext} status={f.status} />
          <div className="min-w-0">
            <div
              className="max-w-[8em] truncate font-medium leading-tight text-foreground/90"
              title={f.name}
            >
              {f.name}
            </div>
            <div className="max-w-[8em] truncate text-[10px] leading-tight text-muted-foreground">
              {f.status === "error" ? (
                <span className="text-red-500" title={f.error}>
                  {f.error}
                </span>
              ) : f.status === "parsing" ? (
                <span className="inline-flex items-center gap-1">
                  <Spinner />
                  {formatSize(f.size)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  {formatSize(f.size)}
                  {f.truncated && (
                    <span title={t("upload.truncatedNotice")} className="text-amber-600">
                      ✂
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            title={t("common.delete")}
            className="ml-0.5 shrink-0 text-muted-foreground/60 transition-colors hover:text-red-500"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * The upload trigger only — a small button ("compact", for toolbars) or a dashed
 * drop zone ("wide", for the editor). Drag-and-drop is scoped to the trigger.
 * Parsed files are reported via onFiles → the parent's useFileUploads().addFiles.
 */
export function FileUploadTrigger({
  onFiles,
  disabled,
  className = "",
  variant = "compact",
}: {
  onFiles: (files: FileList | null) => void;
  disabled?: boolean;
  className?: string;
  variant?: "compact" | "wide";
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerSelect = () => inputRef.current?.click();
  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    onFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);

  return (
    <div
      className={`${variant === "wide" ? "w-full" : "inline-flex"} ${className}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={onSelect}
        className="hidden"
        disabled={disabled}
      />
      {variant === "compact" ? (
        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
            isDragOver ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"
          }`}
        >
          <UploadIcon />
          <span className="text-muted-foreground">{t("upload.button")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors disabled:opacity-50 ${
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/60 hover:bg-muted/30"
          }`}
        >
          <UploadIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{t("upload.button")}</span>
          <span className="text-[11px] text-muted-foreground">{t("upload.hint")}</span>
        </button>
      )}
    </div>
  );
}

function FormatBadge({ ext, status }: { ext: string; status: FileStatus }) {
  const colors: Record<string, string> = {
    docx: "bg-blue-100 text-blue-700",
    pptx: "bg-orange-100 text-orange-700",
    pdf: "bg-red-100 text-red-700",
  };
  const cls =
    status === "error"
      ? "bg-red-100 text-red-600"
      : colors[ext] || "bg-muted text-muted-foreground";
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${cls}`}>
      {ext || "?"}
    </span>
  );
}

function UploadIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 13l3-3m0 0l3 3m-3-3v12M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-4l-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-3 w-3 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
