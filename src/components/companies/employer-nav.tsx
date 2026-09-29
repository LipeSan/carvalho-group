"use client";

import { useTranslations } from "next-intl";
import { BriefcaseBusiness, LayoutDashboard } from "lucide-react";

import { SideNav } from "@/components/navigation/side-nav";

// Menu lateral da área da empresa, no mesmo formato do admin. "Nova vaga" e
// a edição acendem "Vagas" (são subpáginas); criar vaga fica no botão do
// topo da lista.
export function EmployerNav() {
  const t = useTranslations("EmployerArea.nav");

  return (
    <SideNav
      label={t("label")}
      items={[
        {
          href: "/employers/dashboard",
          label: t("dashboard"),
          icon: LayoutDashboard,
        },
        { href: "/employers/jobs", label: t("jobs"), icon: BriefcaseBusiness },
      ]}
    />
  );
}
