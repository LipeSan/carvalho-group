import { useFormatter, useTranslations } from "next-intl";
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatPay } from "@/lib/jobs/format";
import type { ManagedJob } from "@/lib/jobs/manage";
import type { JobStatus } from "@/lib/jobs/options";

import { ContractTypeBadge } from "./contract-type-badge";
import { JobStatusActions, JobStatusBadge } from "./job-status";

// Tabela de vagas das áreas de gestão, igual no admin e na empresa. Quem usa
// decide a rota de edição, a action de status e se mostra a empresa dona.
export function JobsTable({
  rows,
  basePath,
  onStatusChange,
  canPublish = true,
  showCompany = false,
  emptyMessage,
}: {
  rows: ManagedJob[];
  // Ex.: "/admin/jobs" ou "/employers/jobs" (edição em `${basePath}/:id/edit`).
  basePath: string;
  onStatusChange: (
    jobId: number,
    status: JobStatus,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  canPublish?: boolean;
  showCompany?: boolean;
  // Texto da tabela vazia (padrão: "Nenhum resultado para estes filtros").
  emptyMessage?: string;
}) {
  const t = useTranslations("JobsTable");
  const tLists = useTranslations("Lists");
  const tActions = useTranslations("JobActions");
  const tCategories = useTranslations("Categories.list");
  const format = useFormatter();

  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.job")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.type")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.pay")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.published")}</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">{t("columns.actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-muted-foreground"
              >
                {emptyMessage ?? tLists("empty")}
              </td>
            </tr>
          )}
          {rows.map((job) => (
            <tr key={job.id} className="transition-colors hover:bg-muted/50">
              <td className="px-4 py-3">
                <Link
                  href={`${basePath}/${job.id}/edit`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {job.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {tCategories(job.category)} · {job.city}, {job.state}
                </p>
                {showCompany && (
                  <p className="text-xs text-muted-foreground">
                    {job.companyName ?? t("platformJob")}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <ContractTypeBadge type={job.contractType} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatPay(job) ?? "—"}
              </td>
              <td className="px-4 py-3">
                <JobStatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {job.publishedAt
                  ? format.dateTime(job.publishedAt, { dateStyle: "medium" })
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <JobStatusActions
                    jobId={job.id}
                    status={job.status}
                    onChange={onStatusChange}
                    canPublish={canPublish}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={tActions("edit")}
                    render={<Link href={`${basePath}/${job.id}/edit`} />}
                  >
                    <Pencil />
                  </Button>
                  {job.status === "published" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={tActions("viewOnSite")}
                      render={<Link href={`/jobs/${job.id}`} target="_blank" />}
                    >
                      <ExternalLink />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
