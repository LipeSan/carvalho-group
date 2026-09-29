import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/components/legal/legal-page";
import { privacyPolicy, termsOfUse } from "@/content/legal";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return {
    title: t("termsMetaTitle"),
    description: t("termsMetaDescription"),
  };
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      document={termsOfUse[locale as Locale]}
      path="/terms"
      related={{
        href: "/privacy",
        label: privacyPolicy[locale as Locale].title,
      }}
    />
  );
}
