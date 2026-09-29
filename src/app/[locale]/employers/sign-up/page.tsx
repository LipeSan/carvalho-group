import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { CompanyAccountForm } from "@/components/companies/company-account-form";
import { redirectIfSignedIn } from "@/lib/auth/session";

import { employerSignUp } from "./actions";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers/sign-up">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployerSignUp" });
  return { title: t("metaTitle") };
}

export default async function EmployerSignUpPage({
  params,
}: PageProps<"/[locale]/employers/sign-up">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfSignedIn();

  const t = await getTranslations("EmployerSignUp");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} audience="employer">
      <CompanyAccountForm mode="signup" action={employerSignUp} />
      <AuthFooterLink
        text={t("hasAccount")}
        linkLabel={t("signIn")}
        href="/employers/sign-in"
      />
      <AuthFooterLink
        text={t("isCandidate")}
        linkLabel={t("candidateSignUp")}
        href="/sign-up"
      />
    </AuthShell>
  );
}
