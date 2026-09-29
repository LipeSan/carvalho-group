import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { employerSetJobStatus } from "@/app/[locale]/employers/(area)/jobs/actions";
import { PageHeader } from "@/components/navigation/page-header";
import { CompanyStatusNotice } from "@/components/companies/company-status-notice";
import {
  JobListFilterBar,
  parseJobListFilters,
} from "@/components/jobs/job-list-filters";
import { JobsTable } from "@/components/jobs/jobs-table";
import { Pagination, cleanQuery } from "@/components/lists/list-controls";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireEmployer } from "@/lib/companies/accounts";
import { JOB_LIST_PAGE_SIZE, listJobsForManagement } from "@/lib/jobs/manage";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers/jobs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployerJobs" });
  return { title: t("metaTitle") };
}

export default async function EmployerJobsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/employers/jobs">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { company } = await requireEmployer();
  const filters = parseJobListFilters(await searchParams);
  const [t, tLists, { rows, total }] = await Promise.all([
    getTranslations("EmployerJobs"),
    getTranslations("Lists"),
    // Sempre só as vagas desta empresa.
    listJobsForManagement({ kind: "company", companyId: company.id }, filters),
  ]);
  const canPublish = company.status === "approved";
  const hasFilters = Boolean(
    filters.q || filters.status || filters.category || filters.type,
  );

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tLists("resultsCount", { count: total })}
      >
        <Button render={<Link href="/employers/jobs/new" />}>
          <Plus />
          {t("newJob")}
        </Button>
      </PageHeader>

      {!canPublish && (
        <div className="mb-5">
          <CompanyStatusNotice status={company.status} compact />
        </div>
      )}

      <JobListFilterBar path="/employers/jobs" filters={filters} />
      <JobsTable
        rows={rows}
        basePath="/employers/jobs"
        onStatusChange={employerSetJobStatus}
        canPublish={canPublish}
        emptyMessage={hasFilters ? undefined : t("empty")}
      />
      <Pagination
        page={filters.page}
        total={total}
        pageSize={JOB_LIST_PAGE_SIZE}
        hrefFor={(page) => ({
          pathname: "/employers/jobs",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
