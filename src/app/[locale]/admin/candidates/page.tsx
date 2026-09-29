import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { CircleCheck, CircleDashed } from "lucide-react";

import { StatusBadge } from "@/components/admin/badges";
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
import { ADMIN_PAGE_SIZE, listCandidates } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { desiredRoles, isOneOf, usStates } from "@/lib/profile/options";

const stateCodes = Object.keys(usStates) as (keyof typeof usStates)[];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/candidates">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.candidates" });
  return { title: t("title") };
}

export default async function AdminCandidatesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/candidates">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const sp = await searchParams;
  const filters = {
    q: textParam(sp.q),
    state: pickParam(sp.state, stateCodes),
    role: pickParam(sp.role, desiredRoles),
    authorized: pickParam(sp.authorized, ["yes", "no"] as const),
    profile: pickParam(sp.profile, ["complete", "incomplete"] as const),
    status: pickParam(sp.status, ["active", "suspended"] as const),
    page: pageParam(sp.page),
  };

  const [t, tList, tRoles, tProfile, format, { rows, total }] =
    await Promise.all([
      getTranslations("Admin.candidates"),
      getTranslations("Lists"),
      getTranslations("Profile.options.roles"),
      getTranslations("Profile"),
      getFormatter(),
      listCandidates(filters),
    ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tList("resultsCount", { count: total })}
      />

      <FilterBar
        path="/admin/candidates"
        query={filters.q}
        searchPlaceholder={t("searchPlaceholder")}
        selects={[
          {
            name: "state",
            label: t("filters.state"),
            value: filters.state,
            options: stateCodes.map((code) => ({
              value: code,
              label: `${usStates[code]} (${code})`,
            })),
          },
          {
            name: "role",
            label: t("filters.role"),
            value: filters.role,
            options: desiredRoles.map((role) => ({
              value: role,
              label: tRoles(role),
            })),
          },
          {
            name: "authorized",
            label: t("filters.authorized"),
            value: filters.authorized,
            options: [
              { value: "yes", label: tProfile("yes") },
              { value: "no", label: tProfile("no") },
            ],
          },
          {
            name: "profile",
            label: t("filters.profile"),
            value: filters.profile,
            options: [
              { value: "complete", label: t("profileComplete") },
              { value: "incomplete", label: t("profileIncomplete") },
            ],
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
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.location")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.role")}</th>
              <th className="px-4 py-3 font-medium">
                {t("columns.authorized")}
              </th>
              <th className="px-4 py-3 font-medium">{t("columns.profile")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.signedUp")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tList("empty")}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/candidates/${row.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.city && row.state ? `${row.city}, ${row.state}` : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {isOneOf(desiredRoles, row.desiredRole)
                    ? tRoles(row.desiredRole)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.workAuthorized == null
                    ? "—"
                    : row.workAuthorized
                      ? tProfile("yes")
                      : tProfile("no")}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {row.complete ? (
                      <CircleCheck className="size-4 text-emerald-600" />
                    ) : (
                      <CircleDashed className="size-4" />
                    )}
                    {row.complete
                      ? t("profileComplete")
                      : t("profileIncomplete")}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {format.dateTime(row.createdAt, { dateStyle: "medium" })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
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
          pathname: "/admin/candidates",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
