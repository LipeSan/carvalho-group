import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { saveJob } from "@/app/[locale]/admin/actions";
import { JobForm } from "@/components/jobs/job-form";
import { JobStatusBadge } from "@/components/jobs/job-status";
import { PageHeader } from "@/components/navigation/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getJobForAdmin } from "@/lib/admin/jobs";
import { jobToFormValues } from "@/lib/jobs/form";
import { requireAdmin } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/jobs/[id]/edit">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.jobs" });
  return { title: t("editJob") };
}

export default async function AdminEditJobPage({
  params,
}: PageProps<"/[locale]/admin/jobs/[id]/edit">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  // IDs são inteiros positivos; o resto vira 404 sem ir ao banco.
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound();
  const job = await getJobForAdmin(Number(id));
  if (!job) notFound();

  const [t, tActions] = await Promise.all([
    getTranslations("Admin.jobs"),
    getTranslations("JobActions"),
  ]);

  return (
    <>
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>
      <div className="mt-4">
        <PageHeader title={t("editJob")} subtitle={job.title}>
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
        </PageHeader>
      </div>
      <JobForm
        jobId={job.id}
        initialValues={jobToFormValues(job)}
        action={saveJob}
        cancelHref="/admin/jobs"
      />
    </>
  );
}
