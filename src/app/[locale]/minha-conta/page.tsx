import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogOut } from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/minha-conta">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });

  return { title: t("metaTitle") };
}

export default async function AccountPage({
  params,
}: PageProps<"/[locale]/minha-conta">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const t = await getTranslations("Account");

  const details = [
    { label: t("name"), value: user.name },
    { label: t("email"), value: user.email },
    { label: t("accountType"), value: t(`roles.${user.role}`) },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">
          {t("title", { name: user.name.split(" ")[0] })}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

        <dl className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {details.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>

        <form action={logout} className="mt-8">
          <Button type="submit" variant="outline" size="lg">
            <LogOut />
            {t("signOut")}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
