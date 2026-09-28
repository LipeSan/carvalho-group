import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/recuperar-senha">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ForgotPassword" });

  return { title: t("metaTitle") };
}

export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[locale]/recuperar-senha">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ForgotPassword");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <ForgotPasswordForm />
      <AuthFooterLink
        text={t("remembered")}
        linkLabel={t("backToLogin")}
        href="/entrar"
      />
    </AuthShell>
  );
}
