import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirectIfSignedIn } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-up">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SignUp" });

  return { title: t("metaTitle") };
}

export default async function SignUpPage({
  params,
}: PageProps<"/[locale]/sign-up">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfSignedIn();

  const t = await getTranslations("SignUp");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <SignUpForm />
      <AuthFooterLink
        text={t("hasAccount")}
        linkLabel={t("signIn")}
        href="/sign-in"
      />
    </AuthShell>
  );
}
