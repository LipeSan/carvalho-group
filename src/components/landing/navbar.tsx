import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";

import { LanguageSwitcher } from "./language-switcher";

export async function Navbar() {
  const t = await getTranslations("Nav");
  const user = await getCurrentUser();

  const navLinks = [
    { label: t("jobs"), href: "/vagas" },
    { label: t("employers"), href: "/empresas" },
    { label: t("about"), href: "/sobre" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Carvalho Group"
            width={44}
            height={44}
            className="size-10 sm:size-11"
            priority
          />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg font-semibold tracking-wide text-foreground sm:text-xl">
              Carvalho Group
            </span>
            <span className="text-[10px] font-medium tracking-[0.3em] text-primary uppercase">
              Jobs
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          {!user && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/entrar" />}
            >
              {t("signIn")}
            </Button>
          )}
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/empresas/publicar-vaga" />}
          >
            {t("postJob")}
          </Button>
          {user ? (
            <UserMenu name={user.name} email={user.email} />
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="sm:hidden"
              render={<Link href="/entrar" />}
            >
              {t("signIn")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
