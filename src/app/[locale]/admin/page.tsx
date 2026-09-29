import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { PageHeader } from "@/components/navigation/page-header";
import { PendingApprovals } from "@/components/admin/pending-approvals";
import { BarList, ColumnChart, StatTile } from "@/components/admin/stats";
import {
  getDashboardStats,
  getPlatformOverview,
  SIGNUP_DAYS,
} from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { categorySlugs } from "@/lib/jobs/options";
import { getPublishedCountsByCategory } from "@/lib/jobs/queries";
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

  const [t, tRoles, tCategories, format, stats, overview, byCategory] =
    await Promise.all([
      getTranslations("Admin.dashboard"),
      getTranslations("Profile.options.roles"),
      getTranslations("Categories.list"),
      getFormatter(),
      getDashboardStats(),
      getPlatformOverview(),
      getPublishedCountsByCategory(),
    ]);

  const { companiesByStatus, jobsByStatus } = overview;
  // Publicadas e visíveis no site (exclui vagas de empresas não aprovadas).
  const liveJobs = Object.values(byCategory).reduce((sum, n) => sum + n, 0);
  const completeShare = stats.candidates
    ? stats.completeProfiles / stats.candidates
    : 0;
  const weekDelta = stats.newThisWeek - stats.newLastWeek;
  const percent = (value: number) =>
    format.number(value, { style: "percent", maximumFractionDigits: 0 });
  const candidateValue = (value: number, share: number) =>
    t("barValue", { count: value, share: percent(share) });
  const jobValue = (value: number, share: number) =>
    t("jobsBarValue", { count: value, share: percent(share) });

  const dayLabel = (date: Date) =>
    format.dateTime(date, { day: "numeric", month: "short", timeZone: "UTC" });
  const signups = overview.signups;
  const signupTotal = signups.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <PendingApprovals
        total={companiesByStatus.pending}
        companies={overview.pendingCompanies}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          label={t("liveJobs")}
          value={format.number(liveJobs)}
          hint={t("jobsHint", {
            draft: jobsByStatus.draft,
            closed: jobsByStatus.closed,
          })}
        />
        <StatTile
          label={t("approvedCompanies")}
          value={format.number(companiesByStatus.approved)}
          hint={t("companiesHint", {
            pending: companiesByStatus.pending,
            rejected: companiesByStatus.rejected,
          })}
        />
        <StatTile
          label={t("candidates")}
          value={format.number(stats.candidates)}
          hint={t("suspendedCount", { count: stats.suspended })}
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
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ColumnChart
          title={t("signups")}
          summary={t("signupsSummary", {
            count: signupTotal,
            days: SIGNUP_DAYS,
          })}
          tableCaption={t("signups")}
          labels={[
            dayLabel(signups[0].date),
            dayLabel(signups[Math.floor(signups.length / 2)].date),
            dayLabel(signups[signups.length - 1].date),
          ]}
          items={signups.map((item) => ({
            key: item.date.toISOString(),
            label: dayLabel(item.date),
            value: item.value,
            tooltip: t("signupsTooltip", {
              date: dayLabel(item.date),
              count: item.value,
            }),
          }))}
        />
        <BarList
          title={t("jobsByCategory")}
          emptyLabel={t("noData")}
          valueLabel={jobValue}
          items={categorySlugs
            .map((slug) => ({
              key: slug,
              label: tCategories(slug),
              value: byCategory[slug] ?? 0,
            }))
            .sort((a, b) => b.value - a.value)}
        />
        <BarList
          title={t("byState")}
          emptyLabel={t("noData")}
          valueLabel={candidateValue}
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
          valueLabel={candidateValue}
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
