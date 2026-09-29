import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { StatusBadge } from "@/components/admin/badges";
import { CompanyReviewActions } from "@/components/admin/company-review";
import { CompanyStatusBadge } from "@/components/companies/company-status-badge";
import { Link } from "@/i18n/navigation";
import { getCompanyForAdmin } from "@/lib/admin/companies";
import { requireAdmin } from "@/lib/auth/session";
import { formatUsPhone, usStates } from "@/lib/profile/options";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/companies/[id]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.companies" });
  return { title: t("detailTitle") };
}

export default async function AdminCompanyPage({
  params,
}: PageProps<"/[locale]/admin/companies/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  if (!UUID_PATTERN.test(id)) notFound();
  const company = await getCompanyForAdmin(id);
  if (!company) notFound();

  const [t, tRoles, format] = await Promise.all([
    getTranslations("Admin.companies"),
    getTranslations("Admin.companies.memberRoles"),
    getFormatter(),
  ]);
  const date = (value: Date | null) =>
    value
      ? format.dateTime(value, { dateStyle: "medium", timeStyle: "short" })
      : "—";

  const details = [
    { label: t("fields.phone"), value: formatUsPhone(company.phone) },
    {
      label: t("fields.location"),
      value: `${company.city}, ${usStates[company.state as keyof typeof usStates] ?? company.state} (${company.state})`,
    },
    { label: t("fields.ein"), value: company.ein ?? "—" },
    {
      label: t("fields.website"),
      value: company.website ? (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
        >
          {company.website.replace(/^https?:\/\//, "")}
          <ExternalLink className="size-3.5" />
        </a>
      ) : (
        "—"
      ),
    },
    { label: t("fields.createdAt"), value: date(company.createdAt) },
    {
      label: t("fields.reviewed"),
      value: company.reviewedAt
        ? t("reviewedBy", {
            date: date(company.reviewedAt),
            name: company.reviewerName ?? "—",
          })
        : "—",
    },
  ];

  return (
    <>
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-medium">{company.name}</h1>
        <CompanyStatusBadge status={company.status} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-border bg-card">
            <h2 className="border-b border-border px-5 py-3 text-sm font-medium">
              {t("sections.company")}
            </h2>
            <dl className="divide-y divide-border px-5">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <dt className="shrink-0 text-sm text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-sm font-medium sm:text-right">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card">
            <h2 className="border-b border-border px-5 py-3 text-sm font-medium">
              {t("sections.members")}
            </h2>
            <ul className="divide-y divide-border">
              {company.members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email} · {tRoles(member.role)}
                    </p>
                  </div>
                  <StatusBadge status={member.status} />
                </li>
              ))}
            </ul>
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              {t("membersHint")}{" "}
              <Link
                href={{
                  pathname: "/admin/users",
                  query: { role: "employer" },
                }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("goToUsers")}
              </Link>
            </p>
          </section>
        </div>

        <aside className="flex flex-col gap-4 self-start rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">{t("sections.review")}</h2>
          <p className="text-sm text-muted-foreground">
            {t(`reviewHelp.${company.status}`)}
          </p>
          {company.status === "rejected" && company.rejectionReason && (
            <p className="rounded-lg bg-destructive/5 px-3 py-2 text-sm">
              <span className="font-medium">{t("reason")}</span>{" "}
              {company.rejectionReason}
            </p>
          )}
          <CompanyReviewActions
            companyId={company.id}
            status={company.status}
          />
        </aside>
      </div>
    </>
  );
}
