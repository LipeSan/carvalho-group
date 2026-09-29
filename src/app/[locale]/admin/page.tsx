import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { PageHeader } from "@/components/navigation/page-header";
import { BarList, StatTile } from "@/components/admin/stats";
import { getDashboardStats } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { desiredRoles, isOneOf, usStates } from "@/lib/profile/options";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.dashboard" });
  return { title: t("title") };
}

export default async function AdminDashboardPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, tRoles, format, stats] = await Promise.all([
    getTranslations("Admin.dashboard"),
    getTranslations("Profile.options.roles"),
    getFormatter(),
    getDashboardStats(),
  ]);

  const completeShare = stats.candidates
    ? stats.completeProfiles / stats.candidates
    : 0;
  const weekDelta = stats.newThisWeek - stats.newLastWeek;
  const percent = (value: number) =>
    format.number(value, { style: "percent", maximumFractionDigits: 0 });
  const valueLabel = (value: number, share: number) =>
    t("barValue", { count: value, share: percent(share) });

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("candidates")}
          value={format.number(stats.candidates)}
        />
        <StatTile
          label={t("newThisWeek")}
          value={format.number(stats.newThisWeek)}
          delta={{
            value: weekDelta,
            label: t("vsLastWeek", {
              delta: format.number(weekDelta, { signDisplay: "exceptZero" }),
              last: stats.newLastWeek,
            }),
          }}
        />
        <StatTile
          label={t("completeProfiles")}
          value={format.number(stats.completeProfiles)}
          hint={t("ofCandidates", { share: percent(completeShare) })}
        />
        <StatTile
          label={t("suspended")}
          value={format.number(stats.suspended)}
          hint={t("suspendedHint")}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarList
          title={t("byState")}
          emptyLabel={t("noData")}
          valueLabel={valueLabel}
          items={stats.byState.map((item) => ({
            key: item.key,
            label:
              item.key in usStates
                ? `${usStates[item.key as keyof typeof usStates]} (${item.key})`
                : item.key,
            value: item.value,
          }))}
        />
        <BarList
          title={t("byRole")}
          emptyLabel={t("noData")}
          valueLabel={valueLabel}
          items={stats.byRole.map((item) => ({
            key: item.key,
            label: isOneOf(desiredRoles, item.key)
              ? tRoles(item.key)
              : item.key,
            value: item.value,
          }))}
        />
      </div>
    </>
  );
}
