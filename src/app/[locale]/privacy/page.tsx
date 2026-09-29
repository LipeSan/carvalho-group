import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/components/legal/legal-page";
import { privacyPolicy, termsOfUse } from "@/content/legal";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return {
    title: t("privacyMetaTitle"),
    description: t("privacyMetaDescription"),
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      document={privacyPolicy[locale as Locale]}
      path="/privacy"
      related={{ href: "/terms", label: termsOfUse[locale as Locale].title }}
    />
  );
}
