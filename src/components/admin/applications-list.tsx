import { useFormatter, useTranslations } from "next-intl";
import { FileText } from "lucide-react";

import { ApplicationStatusSelect } from "@/components/admin/application-status-select";
import { CompanyStatusBadge } from "@/components/companies/company-status-badge";
import { JobStatusBadge } from "@/components/jobs/job-status";
import { Link } from "@/i18n/navigation";
import type { ApplicationRow } from "@/lib/admin/queries";
import { formatUsPhone } from "@/lib/profile/options";

// Lista de candidaturas do admin. Em tela larga é uma tabela de 4 colunas
// (sem rolagem lateral); abaixo de lg, cada candidatura vira um card. As
// partes de cada linha são as mesmas nos dois formatos.
export function ApplicationsList({ rows }: { rows: ApplicationRow[] }) {
  const t = useTranslations("Admin.applications");
  const tList = useTranslations("Lists");

  if (rows.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        {tList("empty")}
      </p>
    );
  }

  return (
    <>
      <div className="mt-5 hidden rounded-2xl border border-border bg-card lg:block">
        <table className="w-full table-fixed text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-[30%] px-4 py-3 font-medium">
                {t("columns.candidate")}
              </th>
              <th className="w-[26%] px-4 py-3 font-medium">
                {t("columns.job")}
              </th>
              <th className="w-[22%] px-4 py-3 font-medium">
                {t("columns.employer")}
              </th>
              <th className="w-[22%] px-4 py-3 font-medium">
                {t("columns.status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                <td className="px-4 py-3 align-top">
                  <CandidateInfo row={row} />
                </td>
                <td className="px-4 py-3 align-top">
                  <JobInfo row={row} />
                </td>
                <td className="px-4 py-3 align-top">
                  <EmployerInfo row={row} />
                </td>
                <td className="px-4 py-3 align-top">
                  <StageInfo row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-5 flex flex-col gap-3 lg:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-sm"
          >
            <CandidateInfo row={row} />
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <Labeled label={t("columns.job")}>
                <JobInfo row={row} />
              </Labeled>
              <Labeled label={t("columns.employer")}>
                <EmployerInfo row={row} />
              </Labeled>
            </div>
            <div className="border-t border-border pt-4">
              <StageInfo row={row} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function CandidateInfo({ row }: { row: ApplicationRow }) {
  const t = useTranslations("Admin.applications");
  const tProfile = useTranslations("Profile");

  const authorized =
    row.workAuthorized == null
      ? "—"
      : row.workAuthorized
        ? tProfile("yes")
        : tProfile("no");

  return (
    <div className="min-w-0">
      <Link
        href={`/admin/candidates/${row.candidateId}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.candidateName}
      </Link>
      <p
        className="truncate text-xs text-muted-foreground"
        title={row.candidateEmail}
      >
        {row.candidateEmail}
      </p>
      {row.candidateCity && row.candidateState && (
        <p className="text-xs text-muted-foreground">
          {row.candidateCity}, {row.candidateState}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t("authorizedValue", { value: authorized })}
        {row.needsSponsorship && ` · ${t("needsSponsorship")}`}
      </p>
      {row.hasResume && (
        <a
          href={`/api/resumes/${row.candidateId}?view=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          <FileText className="size-3.5" />
          {t("viewResume")}
        </a>
      )}
    </div>
  );
}

function JobInfo({ row }: { row: ApplicationRow }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/admin/jobs/${row.jobId}/edit`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.jobTitle}
      </Link>
      <p className="text-xs text-muted-foreground">
        {row.jobCity}, {row.jobState}
      </p>
      {row.jobStatus !== "published" && (
        <div className="mt-1.5">
          <JobStatusBadge status={row.jobStatus} />
        </div>
      )}
    </div>
  );
}

function EmployerInfo({ row }: { row: ApplicationRow }) {
  const t = useTranslations("Admin.applications");

  if (!row.companyId) {
    return <span className="text-muted-foreground">{t("platformJob")}</span>;
  }
  return (
    <div className="min-w-0">
      <Link
        href={`/admin/companies/${row.companyId}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.companyName}
      </Link>
      {row.companyPhone && (
        <p className="text-xs text-muted-foreground">
          <a
            href={`tel:${row.companyPhone}`}
            className="underline-offset-4 hover:underline"
          >
            {formatUsPhone(row.companyPhone)}
          </a>
        </p>
      )}
      {row.companyStatus && row.companyStatus !== "approved" && (
        <div className="mt-1.5">
          <CompanyStatusBadge status={row.companyStatus} />
        </div>
      )}
    </div>
  );
}

function StageInfo({ row }: { row: ApplicationRow }) {
  const t = useTranslations("Admin.applications");
  const format = useFormatter();

  return (
    <div className="flex flex-col gap-1.5">
      <ApplicationStatusSelect
        applicationId={row.id}
        status={row.status}
        label={t("statusLabel", { name: row.candidateName })}
      />
      <time
        dateTime={row.createdAt.toISOString()}
        title={format.dateTime(row.createdAt, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
        className="text-xs text-muted-foreground"
      >
        {t("appliedAgo", { time: format.relativeTime(row.createdAt) })}
      </time>
    </div>
  );
}
