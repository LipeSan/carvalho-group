"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { revealDocument } from "@/app/[locale]/admin/actions";
import { useConfirm } from "@/components/confirm/confirm-provider";
import { Button } from "@/components/ui/button";

const VISIBLE_FOR_MS = 30_000;

// Documento mascarado com botão "Revelar". Cada revelação é registrada na
// auditoria pelo servidor. O valor some sozinho depois de 30 segundos e não
// fica guardado em lugar nenhum além da memória desta tela.
export function RevealDocument({
  userId,
  document,
  masked,
}: {
  userId: string;
  document: "ssn" | "passportNumber";
  masked: string;
}) {
  const t = useTranslations("Admin.documents");
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!value) return;
    const timeout = setTimeout(() => setValue(null), VISIBLE_FOR_MS);
    return () => clearTimeout(timeout);
  }, [value]);

  const confirm = useConfirm();

  async function reveal() {
    const confirmed = await confirm({
      title: t("revealDialog.title"),
      description: t("revealDialog.description"),
      confirmLabel: t("revealDialog.confirm"),
      destructive: true,
    });
    if (!confirmed) return;
    setError(false);
    startTransition(async () => {
      const result = await revealDocument(userId, document);
      if ("value" in result) setValue(formatDocument(document, result.value));
      else setError(true);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-sm tracking-wider">
        {value ?? masked}
      </span>
      {value ? (
        <Button variant="ghost" size="sm" onClick={() => setValue(null)}>
          <EyeOff />
          {t("hide")}
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={reveal} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Eye />}
          {t("reveal")}
        </Button>
      )}
      {value && (
        <span className="text-xs text-muted-foreground">{t("autoHide")}</span>
      )}
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {t("error")}
        </span>
      )}
    </div>
  );
}

function formatDocument(document: "ssn" | "passportNumber", value: string) {
  return document === "ssn" && /^\d{9}$/.test(value)
    ? `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`
    : value;
}
