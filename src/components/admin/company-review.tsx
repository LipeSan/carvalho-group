"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, CircleX } from "lucide-react";

import { approveCompany, rejectCompany } from "@/app/[locale]/admin/actions";
import { useConfirm } from "@/components/confirm/confirm-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_LIMITS, type CompanyStatus } from "@/lib/companies/options";
import { isOneOf } from "@/lib/profile/options";

const KNOWN_ERRORS = ["notFound", "reasonRequired", "reasonTooLong"] as const;

// Aprovar ou recusar (com motivo, que aparece para a empresa no painel dela).
export function CompanyReviewActions({
  companyId,
  status,
}: {
  companyId: string;
  status: CompanyStatus;
}) {
  const t = useTranslations("Admin.companies.review");
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const errorMessage = (code: string) =>
    isOneOf(KNOWN_ERRORS, code) ? t(`errors.${code}`) : t("errors.generic");

  async function approve() {
    const ok = await confirm({
      title: t("approveDialog.title"),
      description: t("approveDialog.description"),
      confirmLabel: t("approveDialog.confirm"),
    });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const result = await approveCompany(companyId);
      if (!result.ok) setError(errorMessage(result.error));
    });
  }

  async function reject() {
    if (!reason.trim()) {
      setError(t("errors.reasonRequired"));
      return;
    }
    const ok = await confirm({
      title: t("rejectDialog.title"),
      description: t("rejectDialog.description"),
      confirmLabel: t("rejectDialog.confirm"),
      destructive: true,
    });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const result = await rejectCompany(companyId, reason);
      if (result.ok) {
        setRejecting(false);
        setReason("");
      } else {
        setError(errorMessage(result.error));
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          {status !== "approved" && (
            <Button onClick={approve} disabled={pending}>
              <CircleCheck />
              {t("approve")}
            </Button>
          )}
          {status !== "rejected" && (
            <Button
              variant="destructive"
              onClick={() => {
                setError(null);
                setRejecting(true);
              }}
              disabled={pending}
            >
              <CircleX />
              {t("reject")}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <label htmlFor="rejection-reason" className="text-sm font-medium">
            {t("reasonLabel")}
          </label>
          <p className="-mt-1 text-xs text-muted-foreground">
            {t("reasonHint")}
          </p>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={COMPANY_LIMITS.rejectionReasonMax}
            rows={3}
            className="bg-card"
            autoFocus
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setRejecting(false);
                setError(null);
              }}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={reject} disabled={pending}>
              {t("confirmReject")}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
