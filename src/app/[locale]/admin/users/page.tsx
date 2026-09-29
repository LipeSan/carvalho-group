import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { RoleBadge, StatusBadge } from "@/components/admin/badges";
import {
  FilterBar,
  Pagination,
  cleanQuery,
  pageParam,
  pickParam,
  textParam,
} from "@/components/lists/list-controls";
import { PageHeader } from "@/components/navigation/page-header";
import { UserActions } from "@/components/admin/user-actions";
import { Link } from "@/i18n/navigation";
import { ADMIN_PAGE_SIZE, listUsers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";

const roles = ["candidate", "employer", "admin"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/users">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.users" });
  return { title: t("title") };
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/users">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const admin = await requireAdmin();

  const sp = await searchParams;
  const filters = {
    q: textParam(sp.q),
    role: pickParam(sp.role, roles),
    status: pickParam(sp.status, ["active", "suspended"] as const),
    page: pageParam(sp.page),
  };

  const [t, tList, tRoles, format, { rows, total }] = await Promise.all([
    getTranslations("Admin.users"),
    getTranslations("Lists"),
    getTranslations("Admin.roles"),
    getFormatter(),
    listUsers(filters),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tList("resultsCount", { count: total })}
      />

      <FilterBar
        path="/admin/users"
        query={filters.q}
        searchPlaceholder={t("searchPlaceholder")}
        selects={[
          {
            name: "role",
            label: t("filters.role"),
            value: filters.role,
            options: roles.map((role) => ({
              value: role,
              label: tRoles(role),
            })),
          },
          {
            name: "status",
            label: t("filters.status"),
            value: filters.status,
            options: [
              { value: "active", label: tList("statusActive") },
              { value: "suspended", label: tList("statusSuspended") },
            ],
          },
        ]}
      />

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.role")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.sessions")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.signedUp")}</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">{t("columns.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tList("empty")}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                <td className="px-4 py-3">
                  {row.role === "candidate" ? (
                    <Link
                      href={`/admin/candidates/${row.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{row.name}</span>
                  )}
                  {row.id === admin.id && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {t("you")}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={row.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {row.activeSessions}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {format.dateTime(row.createdAt, { dateStyle: "medium" })}
                </td>
                <td className="px-4 py-3">
                  {row.id !== admin.id && (
                    <UserActions
                      userId={row.id}
                      status={row.status}
                      activeSessions={row.activeSessions}
                      compact
                    />
                  )}
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
          pathname: "/admin/users",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
