import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { employerSaveJob } from "@/app/[locale]/employers/(area)/jobs/actions";
import { JobForm } from "@/components/jobs/job-form";
import { JobStatusBadge } from "@/components/jobs/job-status";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireEmployer } from "@/lib/companies/accounts";
import { getJobForCompany } from "@/lib/companies/jobs";
import { jobToFormValues } from "@/lib/jobs/form";
import { jobStatuses, type JobStatus } from "@/lib/jobs/options";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers/jobs/[id]/edit">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployerJobs" });
  return { title: t("editJob") };
}

export default async function EmployerEditJobPage({
  params,
}: PageProps<"/[locale]/employers/jobs/[id]/edit">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const { company } = await requireEmployer();
  // Vaga de outra empresa (ou id inválido) dá 404, como se não existisse.
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound();
  const job = await getJobForCompany(company.id, Number(id));
  if (!job) notFound();

  const [t, tActions] = await Promise.all([
    getTranslations("EmployerJobs"),
    getTranslations("JobActions"),
  ]);
  const canPublish = company.status === "approved";
  // Sem aprovação: rascunho ou encerrada, nunca publicada.
  const allowedStatuses: readonly JobStatus[] = canPublish
    ? jobStatuses
    : ["draft", "closed"];

  return (
    <>
      <Link
        href="/employers/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-medium">{t("editJob")}</h1>
        <div className="flex items-center gap-3">
          <JobStatusBadge status={job.status} />
          {job.status === "published" && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/jobs/${job.id}`} target="_blank" />}
            >
              <ExternalLink />
              {tActions("viewOnSite")}
            </Button>
          )}
        </div>
      </div>
      <JobForm
        jobId={job.id}
        initialValues={jobToFormValues(job)}
        action={employerSaveJob}
        cancelHref="/employers/jobs"
        allowedStatuses={allowedStatuses}
        statusHint={canPublish ? undefined : t("draftOnlyHint")}
      />
    </>
  );
}
