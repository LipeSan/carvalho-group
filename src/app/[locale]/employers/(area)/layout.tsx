import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CompanyStatusBadge } from "@/components/companies/company-status-badge";
import { EmployerNav } from "@/components/companies/employer-nav";
import { SidebarLayout } from "@/components/navigation/sidebar-layout";
import { Link } from "@/i18n/navigation";
import { requireEmployer } from "@/lib/companies/accounts";

export const metadata: Metadata = {
  // A área da empresa não deve aparecer em buscadores.
  robots: { index: false, follow: false },
};

// Área logada da empresa (painel, vagas…), com o mesmo menu lateral do
// admin. Cadastro e login da empresa ficam fora deste grupo.
export default async function EmployerAreaLayout({
  children,
  params,
}: LayoutProps<"/[locale]/employers">) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Proteção da primeira carga; cada página e action também chama
  // requireEmployer(), porque o layout não roda de novo a cada navegação.
  const { company } = await requireEmployer();
  const t = await getTranslations("EmployerArea");

  return (
    <SidebarLayout
      header={
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
            {t("eyebrow")}
          </p>
          <Link
            href="/employers/dashboard"
            className="font-heading text-lg leading-tight font-medium"
          >
            {company.name}
          </Link>
          <div>
            <CompanyStatusBadge status={company.status} />
          </div>
        </div>
      }
      nav={<EmployerNav />}
    >
      {children}
    </SidebarLayout>
  );
}
