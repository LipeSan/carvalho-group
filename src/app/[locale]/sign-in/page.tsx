import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import { redirectIfSignedIn } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });

  return { title: t("metaTitle") };
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfSignedIn();

  const { next } = await searchParams;
  const t = await getTranslations("Login");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <AuthFooterLink
        text={t("noAccount")}
        linkLabel={t("signUp")}
        href="/sign-up"
      />
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("isEmployer")}{" "}
        <Link
          href="/employers/sign-in"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("employerSignIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
