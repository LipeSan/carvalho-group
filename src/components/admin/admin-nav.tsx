"use client";

import { useTranslations } from "next-intl";
import {
  BriefcaseBusiness,
  Building2,
  FileUser,
  History,
  LayoutDashboard,
  UserRoundSearch,
  Users,
} from "lucide-react";

import { SideNav } from "@/components/navigation/side-nav";

export function AdminNav() {
  const t = useTranslations("Admin.nav");

  return (
    <SideNav
      label={t("label")}
      items={[
        {
          href: "/admin",
          label: t("dashboard"),
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/admin/candidates",
          label: t("candidates"),
          icon: UserRoundSearch,
        },
        { href: "/admin/jobs", label: t("jobs"), icon: BriefcaseBusiness },
        {
          href: "/admin/applications",
          label: t("applications"),
          icon: FileUser,
        },
        { href: "/admin/companies", label: t("companies"), icon: Building2 },
        { href: "/admin/users", label: t("users"), icon: Users },
        { href: "/admin/audit", label: t("audit"), icon: History },
      ]}
    />
  );
}
