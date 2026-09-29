import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Plus } from "lucide-react";

import { CompanyStatusBadge } from "@/components/companies/company-status-badge";
import {
  FilterBar,
  Pagination,
  cleanQuery,
  pageParam,
  pickParam,
  textParam,
} from "@/components/lists/list-controls";
import { PageHeader } from "@/components/navigation/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  countPendingCompanies,
  listCompaniesForAdmin,
} from "@/lib/admin/companies";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { companyStatuses } from "@/lib/companies/options";
import { usStates } from "@/lib/profile/options";

const stateCodes = Object.keys(usStates) as (keyof typeof usStates)[];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/companies">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.companies" });
  return { title: t("title") };
}

export default async function AdminCompaniesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/companies">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const sp = await searchParams;
  const filters = {
    q: textParam(sp.q),
    status: pickParam(sp.status, companyStatuses),
    state: pickParam(sp.state, stateCodes),
    page: pageParam(sp.page),
  };

  const [t, tList, tStatus, format, { rows, total }, pendingCount] =
    await Promise.all([
      getTranslations("Admin.companies"),
      getTranslations("Lists"),
      getTranslations("CompanyStatus"),
      getFormatter(),
      listCompaniesForAdmin(filters),
      countPendingCompanies(),
    ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tList("resultsCount", { count: total })}
      >
        <Button render={<Link href="/admin/companies/new" />}>
          <Plus />
          {t("newCompany")}
        </Button>
      </PageHeader>

      {pendingCount > 0 && filters.status !== "pending" && (
        <Link
          href={{ pathname: "/admin/companies", query: { status: "pending" } }}
          className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          {t("pendingBanner", { count: pendingCount })}
          <span className="font-medium underline underline-offset-4">
            {t("reviewNow")}
          </span>
        </Link>
      )}

      <FilterBar
        path="/admin/companies"
        query={filters.q}
        searchPlaceholder={t("searchPlaceholder")}
        selects={[
          {
            name: "status",
            label: t("columns.status"),
            value: filters.status,
            options: companyStatuses.map((status) => ({
              value: status,
              label: tStatus(status),
            })),
          },
          {
            name: "state",
            label: t("columns.state"),
            value: filters.state,
            options: stateCodes.map((code) => ({
              value: code,
              label: `${usStates[code]} (${code})`,
            })),
          },
        ]}
      />

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("columns.company")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.owner")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
              <th className="px-4 py-3 font-medium">
                {t("columns.createdAt")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tList("empty")}
                </td>
              </tr>
            )}
            {rows.map((company) => (
              <tr
                key={company.id}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/companies/${company.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {company.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {company.city}, {company.state}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {company.ownerName ?? "—"}
                  {company.ownerEmail && (
                    <p className="text-xs text-muted-foreground">
                      {company.ownerEmail}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CompanyStatusBadge status={company.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {format.dateTime(company.createdAt, { dateStyle: "medium" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={filters.page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        hrefFor={(page) => ({
          pathname: "/admin/companies",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
