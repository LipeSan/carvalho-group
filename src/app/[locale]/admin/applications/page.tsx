import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BriefcaseBusiness, X } from "lucide-react";

import { ApplicationsList } from "@/components/admin/applications-list";
import {
  FilterBar,
  Pagination,
  cleanQuery,
  pageParam,
  pickParam,
  textParam,
} from "@/components/lists/list-controls";
import { PageHeader } from "@/components/navigation/page-header";
import { Link } from "@/i18n/navigation";
import { getJobForAdmin } from "@/lib/admin/jobs";
import { ADMIN_PAGE_SIZE, listApplications } from "@/lib/admin/queries";
import { applicationStatuses } from "@/lib/applications/options";
import { requireAdmin } from "@/lib/auth/session";
import { categorySlugs } from "@/lib/jobs/options";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/applications">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.applications" });
  return { title: t("title") };
}

export default async function AdminApplicationsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/applications">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const sp = await searchParams;
  // ?job= vem do link com o total de candidaturas na lista de vagas. Vaga
  // inexistente é ignorada.
  const jobParam = Array.isArray(sp.job) ? sp.job[0] : sp.job;
  const job =
    jobParam && /^[1-9]\d{0,9}$/.test(jobParam)
      ? await getJobForAdmin(Number(jobParam))
      : null;
  const filters = {
    job: job?.id,
    q: textParam(sp.q),
    status: pickParam(sp.status, applicationStatuses),
    category: pickParam(sp.category, categorySlugs),
    page: pageParam(sp.page),
  };

  const [t, tList, tCategories, { rows, total }] = await Promise.all([
    getTranslations("Admin.applications"),
    getTranslations("Lists"),
    getTranslations("Categories.list"),
    listApplications(filters),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tList("resultsCount", { count: total })}
      />

      {job && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/40 bg-accent py-1 pr-1 pl-3 text-accent-foreground">
            <BriefcaseBusiness className="size-4 shrink-0" />
            <span className="truncate">
              {t("jobFilter", { title: job.title })}
            </span>
            <Link
              href={{
                pathname: "/admin/applications",
                query: cleanQuery({
                  ...filters,
                  job: undefined,
                  page: undefined,
                }),
              }}
              aria-label={t("clearJobFilter")}
              className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/15"
            >
              <X className="size-3.5" />
            </Link>
          </span>
        </div>
      )}

      <FilterBar
        path="/admin/applications"
        hidden={{ job: filters.job }}
        query={filters.q}
        searchPlaceholder={t("searchPlaceholder")}
        selects={[
          {
            name: "status",
            label: t("filters.status"),
            value: filters.status,
            options: applicationStatuses.map((status) => ({
              value: status,
              label: t(`statuses.${status}`),
            })),
          },
          {
            name: "category",
            label: t("filters.category"),
            value: filters.category,
            options: categorySlugs.map((slug) => ({
              value: slug,
              label: tCategories(slug),
            })),
          },
        ]}
      />

      <ApplicationsList rows={rows} />

      <Pagination
        page={filters.page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        hrefFor={(page) => ({
          pathname: "/admin/applications",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
