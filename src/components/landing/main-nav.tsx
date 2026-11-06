"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { SERVICE_ICONS } from "@/components/services/service-icon";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/lib/services";

// Hrefs vêm prontos do servidor (strings ou { pathname, hash }), para os
// links de âncora da home funcionarem em qualquer página.
type Href = string | { pathname: "/"; hash: string };

export type NavItem = { label: string; href: Href };

export type ServiceNavItem = {
  slug: ServiceSlug;
  label: string;
  description: string;
  href: string;
};

type Props = {
  home: NavItem;
  servicesLabel: string;
  services: ServiceNavItem[];
  links: NavItem[];
  openMenuLabel: string;
  closeMenuLabel: string;
  // Só para visitantes: no celular o botão "Entrar" fica dentro do menu.
  signIn?: { label: string; href: string } | null;
};

const linkClass =
  "text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground";

export function DesktopNav({ home, servicesLabel, services, links }: Props) {
  return (
    <NavigationMenu className="hidden md:flex" align="center">
      <NavigationMenuList className="gap-6">
        <NavigationMenuItem>
          <Link href={home.href} className={linkClass}>
            {home.label}
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={`${linkClass} h-auto bg-transparent px-0 py-0 hover:bg-transparent focus:bg-transparent data-popup-open:bg-transparent data-popup-open:text-foreground data-open:bg-transparent`}
          >
            {servicesLabel}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(92vw,560px)] gap-1 p-2 sm:grid-cols-2">
              {services.map((service) => {
                const Icon = SERVICE_ICONS[service.slug];
                return (
                  <li key={service.slug}>
                    <NavigationMenuLink
                      render={<Link href={service.href} />}
                      className="items-start gap-3 p-3"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          {service.label}
                        </span>
                        <span className="text-xs leading-snug text-muted-foreground">
                          {service.description}
                        </span>
                      </span>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {links.map((link) => (
          <NavigationMenuItem key={link.label}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function MobileNav({
  home,
  servicesLabel,
  services,
  links,
  openMenuLabel,
  closeMenuLabel,
  signIn,
}: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? closeMenuLabel : openMenuLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-border/70 bg-background px-4 pt-4 pb-6 shadow-lg sm:px-6"
        >
          <Link
            href={home.href}
            onClick={close}
            className="mb-3 block border-b border-border/70 pb-3 text-sm font-medium text-foreground"
          >
            {home.label}
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            {servicesLabel}
          </p>
          <ul className="mt-2 flex flex-col">
            {services.map((service) => {
              const Icon = SERVICE_ICONS[service.slug];
              return (
                <li key={service.slug}>
                  <Link
                    href={service.href}
                    onClick={close}
                    className="flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-foreground"
                  >
                    <Icon className="size-4 text-primary" />
                    {service.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="mt-3 flex flex-col border-t border-border/70 pt-3">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block py-2.5 text-sm font-medium text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {signIn && (
            <Button
              className="mt-4 w-full sm:hidden"
              render={<Link href={signIn.href} onClick={close} />}
            >
              {signIn.label}
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
