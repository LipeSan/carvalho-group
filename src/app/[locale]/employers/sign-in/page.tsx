import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { redirectIfSignedIn } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployerSignIn" });
  return { title: t("metaTitle") };
}

// Mesmo login do site (uma conta, um formulário); só muda o texto. Depois de
// entrar, o employer vai para o painel da empresa.
export default async function EmployerSignInPage({
  params,
}: PageProps<"/[locale]/employers/sign-in">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfSignedIn();

  const t = await getTranslations("EmployerSignIn");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} audience="employer">
      <LoginForm />
      <AuthFooterLink
        text={t("noAccount")}
        linkLabel={t("signUp")}
        href="/employers/sign-up"
      />
      <AuthFooterLink
        text={t("isCandidate")}
        linkLabel={t("candidateSignIn")}
        href="/sign-in"
      />
    </AuthShell>
  );
}
