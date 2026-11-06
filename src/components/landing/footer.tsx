import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";
import { serviceHref, serviceSlugs } from "@/lib/services";

type FooterLink = { label: string; href: ComponentProps<typeof Link>["href"] };

export function Footer() {
  const t = useTranslations("Footer");
  const tServices = useTranslations("Services.items");
  const tNav = useTranslations("Nav");

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t("columns.services.title"),
      links: serviceSlugs.map((slug) => ({
        label: tServices(`${slug}.name`),
        href: serviceHref(slug),
      })),
    },
    {
      title: t("columns.candidates.title"),
      links: [
        { label: t("columns.candidates.search"), href: "/jobs" },
        { label: t("columns.candidates.signUp"), href: "/sign-up" },
        { label: t("columns.employers.postJob"), href: "/employers" },
        {
          label: t("columns.employers.employerSignIn"),
          href: "/employers/sign-in",
        },
      ],
    },
    {
      title: t("columns.company.title"),
      links: [
        { label: tNav("home"), href: "/" },
        { label: t("columns.company.about"), href: "/about" },
        { label: t("columns.company.contact"), href: "/contact" },
      ],
    },
    {
      title: t("columns.legal.title"),
      links: [
        { label: t("columns.legal.terms"), href: "/terms" },
        { label: t("columns.legal.privacy"), href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-mark.png"
                alt="Carvalho Consulting Group"
                width={36}
                height={36}
                className="size-9"
              />
              <span className="font-heading text-sm font-semibold tracking-wide">
                Carvalho Consulting Group
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-foreground/60">
              {t("tagline")}
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold tracking-[0.15em] text-gold-soft uppercase">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-foreground/70 transition-colors hover:text-ink-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-ink-foreground/50">
          © {new Date().getFullYear()} Carvalho Consulting Group. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
