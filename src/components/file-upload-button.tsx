"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslation } from "@/i18n";

interface FileUploadButtonProps {
  /** Called with extracted plain text once parsing succeeds. */
  onText: (text: string, meta: { fileName: string; truncated: boolean }) => void;
  /** Disable button (e.g. while a generation is in flight). */
  disabled?: boolean;
  /** Optional className for the button container. */
  className?: string;
  /** "compact" = just the icon button. "wide" = full drop zone with hint text. */
  variant?: "compact" | "wide";
}

const ACCEPT = ".docx,.pptx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation";
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Shared upload UI for docx/pptx/pdf source material.
 * - Hidden <input type="file">, triggered by a button click or drop.
 * - Validates size + extension client-side before hitting the server.
 * - Streams the file via FormData to /api/upload/extract.
 * - Renders inline error / loading state; on success calls onText().
 */
export function FileUploadButton({
  onText,
  disabled,
  className = "",
  variant = "compact",
}: FileUploadButtonProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsingName, setParsingName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      // Client-side guards
      const lowerName = file.name.toLowerCase();
      const validExt =
        lowerName.endsWith(".docx") ||
        lowerName.endsWith(".pptx") ||
        lowerName.endsWith(".pdf");
      if (!validExt) {
        setError(t("upload.unsupported"));
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(t("upload.tooLarge"));
        return;
      }

      setLoading(true);
      setParsingName(file.name);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/extract", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || t("upload.failed"));
          return;
        }
        onText(json.text, {
          fileName: json.meta?.fileName || file.name,
          truncated: !!json.meta?.truncated,
        });
      } catch (e) {
        console.error("[upload] failed:", e);
        setError(t("upload.failed"));
      } finally {
        setLoading(false);
        setParsingName(null);
      }
    },
    [onText, t]
  );

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // Allow re-selecting the same file
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || loading) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !loading) setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const triggerSelect = () => inputRef.current?.click();

  return (
    <div
      className={className}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onSelect}
        className="hidden"
        disabled={disabled || loading}
      />

      {variant === "compact" ? (
        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled || loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted/50 transition-colors disabled:opacity-50 ${
            isDragOver ? "border-accent bg-accent/5" : ""
          }`}
        >
          {loading ? (
            <>
              <Spinner />
              <span className="text-muted-foreground truncate max-w-[140px]">
                {t("upload.parsing", { name: parsingName || "" })}
              </span>
            </>
          ) : (
            <>
              <UploadIcon />
              <span className="text-muted-foreground">{t("upload.button")}</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled || loading}
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/60 hover:bg-muted/30"
          }`}
        >
          {loading ? (
            <>
              <Spinner />
              <span className="text-xs text-muted-foreground">
                {t("upload.parsing", { name: parsingName || "" })}
              </span>
            </>
          ) : (
            <>
              <UploadIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{t("upload.button")}</span>
              <span className="text-[11px] text-muted-foreground">
                {t("upload.hint")}
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-[11px] text-red-500">{error}</p>
      )}
    </div>
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
    <svg
      className="animate-spin w-3.5 h-3.5 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
