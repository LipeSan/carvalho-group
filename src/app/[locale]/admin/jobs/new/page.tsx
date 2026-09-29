import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { saveJob } from "@/app/[locale]/admin/actions";
import { JobForm } from "@/components/jobs/job-form";
import { PageHeader } from "@/components/navigation/page-header";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/jobs/new">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.jobs" });
  return { title: t("newJob") };
}

export default async function AdminNewJobPage({
  params,
}: PageProps<"/[locale]/admin/jobs/new">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations("Admin.jobs");

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
        <PageHeader title={t("newJob")} subtitle={t("newJobSubtitle")} />
      </div>
      <JobForm
        action={saveJob}
        cancelHref="/admin/jobs"
        // Padrões mais comuns para as vagas da plataforma.
        initialValues={{
          workMode: "onsite",
          payPeriod: "hour",
          status: "draft",
        }}
      />
    </>
  );
}
