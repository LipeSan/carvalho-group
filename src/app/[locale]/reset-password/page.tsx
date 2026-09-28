import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { FormAlert } from "@/components/forms/form-fields";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { findValidResetToken } from "@/lib/auth/password-reset";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/reset-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ResetPassword" });

  return { title: t("metaTitle") };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { token } = await searchParams;
  const t = await getTranslations("ResetPassword");

  // Valida o link já na abertura para não pedir uma senha nova à toa. A action
  // valida de novo, pois o token pode expirar enquanto a página está aberta.
  const resetToken = typeof token === "string" ? token : null;
  const isValid =
    resetToken !== null && (await findValidResetToken(resetToken)) !== null;

  if (!resetToken || !isValid) {
    return (
      <AuthShell title={t("invalidTitle")}>
        <FormAlert>{t("invalidText")}</FormAlert>
        <AuthFooterLink
          text={t("invalidHint")}
          linkLabel={t("requestNew")}
          href="/forgot-password"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <ResetPasswordForm token={resetToken} />
    </AuthShell>
  );
}
