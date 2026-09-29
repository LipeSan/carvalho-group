import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import {
  AUDIT_ACTION_KEYS,
  AuditActionLabel,
} from "@/components/admin/audit-action-label";
import {
  FilterBar,
  Pagination,
  cleanQuery,
  pageParam,
  pickParam,
} from "@/components/lists/list-controls";
import { PageHeader } from "@/components/navigation/page-header";
import { Link } from "@/i18n/navigation";
import { auditActions } from "@/lib/admin/audit";
import { ADMIN_PAGE_SIZE, listAuditLogs } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/audit">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.audit" });
  return { title: t("title") };
}

export default async function AdminAuditPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/audit">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const sp = await searchParams;
  const filters = {
    action: pickParam(sp.action, auditActions),
    page: pageParam(sp.page),
  };

  const [t, tList, format, { rows, total }] = await Promise.all([
    getTranslations("Admin.audit"),
    getTranslations("Lists"),
    getFormatter(),
    listAuditLogs(filters),
  ]);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <FilterBar
        path="/admin/audit"
        selects={[
          {
            name: "action",
            label: t("filters.action"),
            value: filters.action,
            options: auditActions.map((action) => ({
              value: action,
              label: t(`filterLabels.${AUDIT_ACTION_KEYS[action]}`),
            })),
          },
        ]}
      />

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("columns.when")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.actor")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.action")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.target")}</th>
              <th className="px-4 py-3 font-medium">{t("columns.ip")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tList("empty")}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {format.dateTime(row.createdAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  {row.actorName ?? (
                    <span className="text-muted-foreground">
                      {t("deletedUser")}
                    </span>
                  )}
                  {row.actorEmail && (
                    <p className="text-xs text-muted-foreground">
                      {row.actorEmail}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  <AuditActionLabel
                    action={row.action}
                    metadata={row.metadata}
                  />
                </td>
                <td className="px-4 py-3">
                  {row.targetName ? (
                    row.targetRole === "candidate" && row.targetId ? (
                      <Link
                        href={`/admin/candidates/${row.targetId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {row.targetName}
                      </Link>
                    ) : (
                      row.targetName
                    )
                  ) : (
                    // Sem nome: ou a ação não afeta uma conta (vagas, aprovar empresa) ou
                    // a conta foi removida depois.
                    <span className="text-muted-foreground">
                      {row.targetId === null &&
                      !/^(job|company)\./.test(row.action)
                        ? t("deletedUser")
                        : "—"}
                    </span>
                  )}
                  {row.targetEmail && (
                    <p className="text-xs text-muted-foreground">
                      {row.targetEmail}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {row.ipAddress ?? "—"}
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
          pathname: "/admin/audit",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
