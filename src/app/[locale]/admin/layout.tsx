import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { SidebarLayout } from "@/components/navigation/sidebar-layout";
import { requireAdmin } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/admin">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    title: { template: `%s | ${t("title")}`, default: t("title") },
    // A área administrativa nunca deve aparecer em buscadores.
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Proteção da primeira carga. Cada página e action também chama
  // requireAdmin(), porque o layout não roda de novo a cada navegação.
  await requireAdmin();
  const t = await getTranslations("Admin");

  return (
    <SidebarLayout
      header={
        <p className="hidden items-center gap-2 text-xs font-semibold tracking-[0.15em] text-primary uppercase lg:flex">
          <ShieldCheck className="size-4" />
          {t("title")}
        </p>
      }
      nav={<AdminNav />}
    >
      {children}
    </SidebarLayout>
  );
}
