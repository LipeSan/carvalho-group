import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { CompanyStatusNotice } from "@/components/companies/company-status-notice";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireEmployer } from "@/lib/companies/accounts";
import { countJobsByStatus } from "@/lib/companies/jobs";
import { jobStatuses } from "@/lib/jobs/options";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers/dashboard">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployerDashboard" });
  return { title: t("metaTitle") };
}

export default async function EmployerDashboardPage({
  params,
}: PageProps<"/[locale]/employers/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { company } = await requireEmployer();
  const [t, tStatus, counts] = await Promise.all([
    getTranslations("EmployerDashboard"),
    getTranslations("JobForm.status"),
    countJobsByStatus(company.id),
  ]);

  return (
    <>
      <h1 className="mb-6 font-heading text-3xl font-medium">{t("title")}</h1>
      <CompanyStatusNotice
        status={company.status}
        rejectionReason={company.rejectionReason}
      />

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-medium">{t("jobsTitle")}</h2>
          <Button render={<Link href="/employers/jobs/new" />}>
            <Plus />
            {t("newJob")}
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {jobStatuses.map((status) => (
            <Link
              key={status}
              href={{ pathname: "/employers/jobs", query: { status } }}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <p className="text-sm text-muted-foreground">{tStatus(status)}</p>
              <p className="mt-2 font-heading text-3xl font-medium tabular-nums">
                {counts[status] ?? 0}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
