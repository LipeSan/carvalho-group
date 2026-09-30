import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { setJobStatus } from "@/app/[locale]/admin/actions";
import { PageHeader } from "@/components/navigation/page-header";
import {
  JobListFilterBar,
  parseJobListFilters,
} from "@/components/jobs/job-list-filters";
import { JobsTable } from "@/components/jobs/jobs-table";
import { Pagination, cleanQuery } from "@/components/lists/list-controls";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { JOB_LIST_PAGE_SIZE, listJobsForManagement } from "@/lib/jobs/manage";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/jobs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.jobs" });
  return { title: t("title") };
}

export default async function AdminJobsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/jobs">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const filters = parseJobListFilters(await searchParams);
  const [t, tLists, { rows, total }] = await Promise.all([
    getTranslations("Admin.jobs"),
    getTranslations("Lists"),
    // Admin vê as vagas de todas as empresas e as da plataforma.
    listJobsForManagement({ kind: "all" }, filters),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tLists("resultsCount", { count: total })}
      >
        <Button render={<Link href="/admin/jobs/new" />}>
          <Plus />
          {t("newJob")}
        </Button>
      </PageHeader>

      <JobListFilterBar path="/admin/jobs" filters={filters} />
      <JobsTable
        rows={rows}
        basePath="/admin/jobs"
        onStatusChange={setJobStatus}
        showCompany
        showApplications
      />
      <Pagination
        page={filters.page}
        total={total}
        pageSize={JOB_LIST_PAGE_SIZE}
        hrefFor={(page) => ({
          pathname: "/admin/jobs",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
