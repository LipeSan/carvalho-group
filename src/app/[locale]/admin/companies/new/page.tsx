import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Info } from "lucide-react";

import { adminCreateCompany } from "@/app/[locale]/admin/actions";
import { PageHeader } from "@/components/navigation/page-header";
import { CompanyAccountForm } from "@/components/companies/company-account-form";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/companies/new">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.companies" });
  return { title: t("newCompany") };
}

export default async function AdminNewCompanyPage({
  params,
}: PageProps<"/[locale]/admin/companies/new">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations("Admin.companies");

  return (
    <>
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>
      <div className="mt-4">
        <PageHeader
          title={t("newCompany")}
          subtitle={t("newCompanySubtitle")}
        />
      </div>
      <div className="max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-7">
        <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {t("newCompanyNote")}
        </p>
        <CompanyAccountForm mode="admin" action={adminCreateCompany} />
      </div>
    </>
  );
}
