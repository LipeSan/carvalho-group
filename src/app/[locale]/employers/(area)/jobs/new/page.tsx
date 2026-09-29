import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { employerSaveJob } from "@/app/[locale]/employers/(area)/jobs/actions";
import { JobForm } from "@/components/jobs/job-form";
import { Link } from "@/i18n/navigation";
import { requireEmployer } from "@/lib/companies/accounts";
import { jobStatuses } from "@/lib/jobs/options";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers/jobs/new">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployerJobs" });
  return { title: t("newJob") };
}

export default async function EmployerNewJobPage({
  params,
}: PageProps<"/[locale]/employers/jobs/new">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { company } = await requireEmployer();
  const t = await getTranslations("EmployerJobs");
  const canPublish = company.status === "approved";

  return (
    <>
      <Link
        href="/employers/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>
      <h1 className="mt-4 mb-6 font-heading text-2xl font-medium">
        {t("newJob")}
      </h1>
      <JobForm
        action={employerSaveJob}
        cancelHref="/employers/jobs"
        initialValues={{
          workMode: "onsite",
          payPeriod: "hour",
          status: "draft",
        }}
        // Empresa em análise ou recusada só salva rascunho.
        allowedStatuses={canPublish ? jobStatuses : ["draft"]}
        statusHint={canPublish ? undefined : t("draftOnlyHint")}
      />
    </>
  );
}
