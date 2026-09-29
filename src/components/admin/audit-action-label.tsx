import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { AuditAction } from "@/lib/admin/audit";
import { isOneOf } from "@/lib/profile/options";
import { jobStatuses } from "@/lib/jobs/options";

// Chaves de tradução (Admin.audit.actions.*) para cada ação registrada.
export const AUDIT_ACTION_KEYS = {
  "document.reveal": "documentReveal",
  "user.suspend": "userSuspend",
  "user.reactivate": "userReactivate",
  "user.revokeSessions": "userRevokeSessions",
  "job.create": "jobCreate",
  "job.update": "jobUpdate",
  "job.statusChange": "jobStatusChange",
  "company.create": "companyCreate",
  "company.approve": "companyApprove",
  "company.reject": "companyReject",
} as const satisfies Record<AuditAction, string>;

export function AuditActionLabel({
  action,
  metadata,
}: {
  action: string;
  metadata: Record<string, string> | null;
}) {
  const t = useTranslations("Admin.audit");
  const tFields = useTranslations("Profile.fields");
  const tStatus = useTranslations("JobForm.status");

  if (!(action in AUDIT_ACTION_KEYS)) return <>{action}</>;
  const key = AUDIT_ACTION_KEYS[action as AuditAction];

  if (key === "documentReveal") {
    const document =
      metadata?.document === "ssn"
        ? tFields("ssn")
        : metadata?.document === "passportNumber"
          ? tFields("passportNumber")
          : "?";
    return <>{t("actions.documentReveal", { document })}</>;
  }

  if (key === "jobCreate" || key === "jobUpdate" || key === "jobStatusChange") {
    // O título vai como link para a edição da vaga.
    const title = metadata?.jobId ? (
      <Link
        href={`/admin/jobs/${metadata.jobId}/edit`}
        className="underline-offset-4 hover:underline"
      >
        “{metadata.title}”
      </Link>
    ) : (
      `“${metadata?.title ?? "?"}”`
    );
    const status = isOneOf(jobStatuses, metadata?.status)
      ? tStatus(metadata.status)
      : "";
    return (
      <>
        {t.rich(`actions.${key}`, {
          title: () => title,
          status,
        })}
      </>
    );
  }

  if (
    key === "companyCreate" ||
    key === "companyApprove" ||
    key === "companyReject"
  ) {
    // O nome vai como link para a página da empresa no admin.
    const name = metadata?.companyId ? (
      <Link
        href={`/admin/companies/${metadata.companyId}`}
        className="underline-offset-4 hover:underline"
      >
        {metadata.name}
      </Link>
    ) : (
      (metadata?.name ?? "?")
    );
    return (
      <>
        {t.rich(`actions.${key}`, { name: () => name })}
        {key === "companyReject" && metadata?.reason && (
          <span className="block text-xs font-normal text-muted-foreground">
            “{metadata.reason}”
          </span>
        )}
      </>
    );
  }

  return <>{t(`actions.${key}`)}</>;
}
