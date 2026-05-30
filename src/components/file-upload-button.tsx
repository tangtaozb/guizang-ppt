"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "@/i18n";

interface FileUploadButtonProps {
  /**
   * Called whenever the set of successfully-parsed files changes, with the
   * combined plain text of ALL parsed files (empty string when none remain).
   * The parent merges this with any manually-typed text at generate time.
   */
  onFilesChange: (combinedText: string) => void;
  /** Disable the trigger (e.g. while a generation is in flight). */
  disabled?: boolean;
  /** Optional className for the root container. */
  className?: string;
  /** "compact" = small button (dashboard). "wide" = dashed drop zone (editor). */
  variant?: "compact" | "wide";
}

type FileStatus = "parsing" | "done" | "error";

interface UploadedFile {
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
 * Upload UI for docx/pptx/pdf source material.
 * - Supports selecting / dropping MULTIPLE files at once.
 * - Each file becomes a chip showing name + format + size + status.
 * - Extracted text is NOT shown (no big-text preview); it's reported to the
 *   parent via onFilesChange and merged at generate time.
 */
export function FileUploadButton({
  onFilesChange,
  disabled,
  className = "",
  variant = "compact",
}: FileUploadButtonProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Recompute the combined text from a files snapshot and notify the parent.
  const emit = useCallback(
    (list: UploadedFile[]) => {
      const combined = list
        .filter((f) => f.status === "done" && f.text.trim())
        .map((f) => `【${f.name}】\n${f.text.trim()}`)
        .join("\n\n");
      onFilesChange(combined);
    },
    [onFilesChange]
  );

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
        setFiles((prev) => {
          const next = prev.map((f): UploadedFile => {
            if (f.id !== id) return f;
            if (!res.ok) {
              return {
                ...f,
                status: "error",
                error: json.error || t("upload.failed"),
              };
            }
            return {
              ...f,
              status: "done",
              text: json.text || "",
              truncated: !!json.meta?.truncated,
            };
          });
          emit(next);
          return next;
        });
      } catch (e) {
        console.error("[upload] failed:", e);
        setFiles((prev) => {
          const next = prev.map((f): UploadedFile =>
            f.id === id ? { ...f, status: "error", error: t("upload.failed") } : f
          );
          emit(next);
          return next;
        });
      }
    },
    [emit, t]
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

  const removeFile = useCallback(
    (id: number) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== id);
        emit(next);
        return next;
      });
    },
    [emit]
  );

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const triggerSelect = () => inputRef.current?.click();

  return (
    <div
      className={`${variant === "compact" ? "flex flex-col items-start gap-2" : ""} ${className}`}
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
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
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
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/60 hover:bg-muted/30"
          }`}
        >
          <UploadIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{t("upload.button")}</span>
          <span className="text-[11px] text-muted-foreground">{t("upload.hint")}</span>
        </button>
      )}

      {files.length > 0 && (
        <ul className={`w-full space-y-1.5 ${variant === "wide" ? "mt-2" : ""}`}>
          {files.map((f) => (
            <li
              key={f.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                f.status === "error" ? "border-red-200 bg-red-50/50" : "border-border bg-muted/30"
              }`}
            >
              <FormatBadge ext={f.ext} status={f.status} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground/90">{f.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {f.status === "error" ? (
                    <span className="text-red-500">{f.error}</span>
                  ) : f.status === "parsing" ? (
                    <span className="inline-flex items-center gap-1">
                      <Spinner />
                      <span>
                        {f.ext.toUpperCase()} · {formatSize(f.size)}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      {f.ext.toUpperCase()} · {formatSize(f.size)}
                      {f.truncated && (
                        <span
                          title={t("upload.truncatedNotice")}
                          className="rounded bg-amber-100 px-1 text-[10px] text-amber-700"
                        >
                          ✂
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                title={t("common.delete")}
                className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
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
    <svg className="animate-spin w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
