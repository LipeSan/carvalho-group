"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { LogOut, ShieldBan, ShieldCheck } from "lucide-react";

import {
  reactivateUser,
  revokeUserSessions,
  suspendUser,
  type AdminActionResult,
} from "@/app/[locale]/admin/actions";
import { useConfirm } from "@/components/confirm/confirm-provider";
import { Button } from "@/components/ui/button";

// Ações sobre uma conta. Suspender e encerrar sessões pedem confirmação.
// Não aparece para a própria conta do admin.
export function UserActions({
  userId,
  status,
  activeSessions,
  compact = false,
}: {
  userId: string;
  status: "active" | "suspended";
  activeSessions: number;
  compact?: boolean;
}) {
  const t = useTranslations("Admin.actions");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const confirm = useConfirm();

  async function run(
    action: (id: string) => Promise<AdminActionResult>,
    dialog?: "suspendDialog" | "revokeDialog",
  ) {
    if (
      dialog &&
      !(await confirm({
        title: t(`${dialog}.title`),
        description: t(`${dialog}.description`),
        confirmLabel: t(`${dialog}.confirm`),
        destructive: true,
      }))
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await action(userId);
      if (!result.ok) setError(t(`errors.${result.error}`));
    });
  }

  const size = compact ? "sm" : "default";

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {status === "active" ? (
          <Button
            variant="destructive"
            size={size}
            disabled={pending}
            onClick={() => run(suspendUser, "suspendDialog")}
          >
            <ShieldBan />
            {t("suspend")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size={size}
            disabled={pending}
            onClick={() => run(reactivateUser)}
          >
            <ShieldCheck />
            {t("reactivate")}
          </Button>
        )}
        {activeSessions > 0 && status === "active" && (
          <Button
            variant="outline"
            size={size}
            disabled={pending}
            onClick={() => run(revokeUserSessions, "revokeDialog")}
          >
            <LogOut />
            {t("revokeSessions")}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
