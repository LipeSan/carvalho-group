"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Archive, CircleDot, FilePen, Send, Undo2 } from "lucide-react";

import { useConfirm } from "@/components/confirm/confirm-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobStatus } from "@/lib/jobs/options";

// Status com ícone + texto (nunca só cor).
export function JobStatusBadge({ status }: { status: JobStatus }) {
  const t = useTranslations("JobForm.status");

  if (status === "published") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      >
        <CircleDot />
        {t("published")}
      </Badge>
    );
  }
  if (status === "draft") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <FilePen />
        {t("draft")}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Archive />
      {t("closed")}
    </Badge>
  );
}

// Ações rápidas de status na lista: rascunho → publicar; publicada →
// encerrar; encerrada → republicar. Encerrar pede confirmação.
export function JobStatusActions({
  jobId,
  status,
  onChange,
  canPublish = true,
}: {
  jobId: number;
  status: JobStatus;
  // Action que muda o status (a do admin ou a da empresa).
  onChange: (
    jobId: number,
    status: JobStatus,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  // Empresa ainda não aprovada não pode publicar.
  canPublish?: boolean;
}) {
  const t = useTranslations("JobActions");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const confirm = useConfirm();

  async function change(next: JobStatus, withConfirmation = false) {
    if (
      withConfirmation &&
      !(await confirm({
        title: t("closeDialog.title"),
        description: t("closeDialog.description"),
        confirmLabel: t("closeDialog.confirm"),
        destructive: true,
      }))
    ) {
      return;
    }
    setError(false);
    startTransition(async () => {
      const result = await onChange(jobId, next);
      if (!result.ok) setError(true);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {status === "published" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => change("closed", true)}
        >
          <Archive />
          {t("close")}
        </Button>
      ) : canPublish ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => change("published")}
        >
          {status === "closed" ? <Undo2 /> : <Send />}
          {status === "closed" ? t("republish") : t("publish")}
        </Button>
      ) : null}
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {t("error")}
        </span>
      )}
    </div>
  );
}
