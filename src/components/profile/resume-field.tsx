"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { useFormatter, useTranslations } from "next-intl";
import { Download, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";

import { removeResume, saveResume } from "@/app/[locale]/profile/actions";
import { useConfirm } from "@/components/confirm/confirm-provider";
import { Button } from "@/components/ui/button";
import {
  RESUME_ACCEPT,
  RESUME_CONTENT_TYPE,
  RESUME_MAX_BYTES,
  isPdfFileName,
  resumeUploadPathname,
} from "@/lib/resumes/options";

type ResumeError = "type" | "size" | "upload";

// Campo de CV (opcional). Salva sozinho, fora do formulário do passo: o
// arquivo vai do navegador direto para o Blob e depois a action o liga ao
// perfil.
export function ResumeField({
  userId,
  resume,
}: {
  userId: string;
  resume: { fileName: string | null; size: number; uploadedAt: Date } | null;
}) {
  const t = useTranslations("Profile.resume");
  const format = useFormatter();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<ResumeError | null>(null);

  const busy = pending || progress !== null;
  const maxMb = RESUME_MAX_BYTES / (1024 * 1024);

  async function handleFile(file: File) {
    setError(null);
    // Alguns sistemas não informam o tipo; o servidor confere o conteúdo.
    if (
      !isPdfFileName(file.name) ||
      (file.type && file.type !== RESUME_CONTENT_TYPE)
    ) {
      return setError("type");
    }
    if (file.size > RESUME_MAX_BYTES) return setError("size");

    setProgress(0);
    try {
      const blob = await upload(resumeUploadPathname(userId), file, {
        access: "private",
        handleUploadUrl: "/api/resumes/upload",
        contentType: RESUME_CONTENT_TYPE,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      startTransition(async () => {
        const result = await saveResume(blob.pathname, file.name);
        if (!result.ok) setError("upload");
      });
    } catch {
      setError("upload");
    } finally {
      setProgress(null);
    }
  }

  async function handleRemove() {
    if (
      !(await confirm({
        title: t("removeDialog.title"),
        description: t("removeDialog.description"),
        confirmLabel: t("removeDialog.confirm"),
        destructive: true,
      }))
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await removeResume();
      if (!result.ok) setError("upload");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Limpa para permitir escolher o mesmo arquivo de novo.
          event.target.value = "";
          if (file) handleFile(file);
        }}
      />

      {resume ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {resume.fileName ?? t("defaultName")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("fileInfo", {
                size: format.number(resume.size / 1024, {
                  maximumFractionDigits: 0,
                }),
                date: format.dateTime(resume.uploadedAt, {
                  dateStyle: "medium",
                }),
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<a href={`/api/resumes/${userId}`} download />}
            >
              <Download />
              {t("download")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload />
              {t("replace")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={handleRemove}
              aria-label={t("remove")}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-auto flex-col gap-1 border-dashed py-6"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-5" />
          <span className="font-medium">{t("upload")}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {t("hint", { max: maxMb })}
          </span>
        </Button>
      )}

      {busy && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin" />
          {progress !== null
            ? t("uploading", { percentage: Math.round(progress) })
            : t("saving")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`, { max: maxMb })}
        </p>
      )}
    </div>
  );
}
