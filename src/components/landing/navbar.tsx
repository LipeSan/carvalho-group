import { getTranslations } from "next-intl/server";

import { UserMenu } from "@/components/auth/user-menu";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { serviceHref, serviceSlugs } from "@/lib/services";

import { LanguageSwitcher } from "./language-switcher";
import { DesktopNav, MobileNav, type NavItem } from "./main-nav";

export async function Navbar() {
  const [t, tServices, user] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Services.items"),
    getCurrentUser(),
  ]);

  const services = serviceSlugs.map((slug) => ({
    slug,
    label: tServices(`${slug}.name`),
    description: tServices(`${slug}.short`),
    href: serviceHref(slug),
  }));

  // Vagas não tem item próprio: fica dentro de Serviços (Carvalho Group Jobs).
  const links: NavItem[] = [
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  const navProps = {
    home: { label: t("home"), href: "/" },
    servicesLabel: t("services"),
    services,
    links,
    openMenuLabel: t("openMenu"),
    closeMenuLabel: t("closeMenu"),
    signIn: user ? null : { label: t("signIn"), href: "/sign-in" },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo />

        <DesktopNav {...navProps} />

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          {!user && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/sign-in" />}
            >
              {t("signIn")}
            </Button>
          )}
          {/* Publicar vaga é só para empresas logadas. */}
          {user?.role === "employer" && (
            <Button
              size="sm"
              className="hidden lg:inline-flex"
              render={<Link href="/employers/jobs/new" />}
            >
              {t("postJob")}
            </Button>
          )}
          {/* No celular, "Entrar" fica dentro do menu para a marca caber. */}
          {user && (
            <UserMenu name={user.name} email={user.email} role={user.role} />
          )}
          <MobileNav {...navProps} />
        </div>
      </div>
    </header>
  );
}
