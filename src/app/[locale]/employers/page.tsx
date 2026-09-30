import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Banknote,
  BadgeCheck,
  Building2,
  ChevronDown,
  Clock,
  Languages,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import { CATEGORY_ICONS } from "@/components/jobs/category-icons";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { StatsBar } from "@/components/landing/stats-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { categorySlugs } from "@/lib/jobs/options";
import { formatUsPhone } from "@/lib/profile/options";
import { COMPANY_APPROVAL_BUSINESS_DAYS, siteContact } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/employers">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EmployersLanding" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const faqKeys = [
  "cost",
  "approval",
  "ein",
  "confidential",
  "candidates",
  "manage",
  "language",
] as const;

const featureKeys: { key: string; icon: LucideIcon }[] = [
  { key: "confidential", icon: Lock },
  { key: "profiles", icon: UserRoundCheck },
  { key: "languages", icon: Languages },
  { key: "payTransparency", icon: Banknote },
  { key: "verified", icon: BadgeCheck },
  { key: "free", icon: Building2 },
];

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-heading text-3xl font-medium text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-muted-foreground text-balance">{subtitle}</p>
      )}
    </div>
  );
}

export default async function EmployersLandingPage({
  params,
}: PageProps<"/[locale]/employers">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tJobs, tCategories, user] = await Promise.all([
    getTranslations("EmployersLanding"),
    getTranslations("Jobs"),
    getTranslations("Categories.list"),
    getCurrentUser(),
  ]);

  // Empresa já logada vai direto ao painel; os demais, ao cadastro.
  const isEmployer = user?.role === "employer";
  const primaryHref = isEmployer ? "/employers/jobs/new" : "/employers/sign-up";
  const primaryLabel = isEmployer ? t("ctaNewJob") : t("ctaPrimary");
  const secondaryHref = isEmployer
    ? "/employers/dashboard"
    : "/employers/sign-in";
  const secondaryLabel = isEmployer ? t("ctaDashboard") : t("ctaSignIn");

  const days = COMPANY_APPROVAL_BUSINESS_DAYS;
  const hasContact = Boolean(siteContact.email || siteContact.phone);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--accent),transparent)]">
          <Image
            src="/logo-mark.png"
            alt=""
            aria-hidden
            width={900}
            height={900}
            className="pointer-events-none absolute -top-40 -left-40 hidden opacity-[0.05] md:block"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                {t("hero.eyebrow")}
              </span>
              <h1 className="mt-6 font-heading text-4xl font-medium text-balance sm:text-5xl">
                {t.rich("hero.title", {
                  highlight: (chunks) => (
                    <span className="text-primary">{chunks}</span>
                  ),
                })}
              </h1>
              <p className="mt-5 text-lg text-muted-foreground text-balance">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-6"
                  render={<Link href={primaryHref} />}
                >
                  {primaryLabel}
                  <ArrowRight />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6"
                  render={<Link href={secondaryHref} />}
                >
                  {secondaryLabel}
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("hero.note", { days })}
              </p>
            </div>

            {/* Exemplo de como a vaga aparece para os candidatos. */}
            <figure className="relative mx-auto w-full max-w-sm">
              <div className="rotate-1 rounded-2xl border border-border/80 bg-card p-5 shadow-2xl shadow-primary/10">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-accent text-accent-foreground"
                  >
                    {tCategories("cook")}
                  </Badge>
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    <Lock className="size-3" />
                    {tJobs("confidentialCompany")}
                  </span>
                </div>
                <p className="mt-4 font-heading text-xl font-medium">
                  {t("preview.title")}
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {t("preview.location")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Banknote className="size-4 text-primary" />
                    {t("preview.pay")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    {tJobs("postedToday")}
                  </span>
                </div>
                <div className="mt-5 rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground">
                  {tJobs("viewJob")}
                </div>
              </div>
              <figcaption className="mt-5 text-center text-xs text-muted-foreground">
                {t("preview.caption")}
              </figcaption>
            </figure>
          </div>
        </section>

        <StatsBar />

        {/* Áreas */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow={t("areas.eyebrow")}
            title={t("areas.title")}
            subtitle={t("areas.subtitle")}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categorySlugs.map((slug) => {
              const Icon = CATEGORY_ICONS[slug];
              return (
                <div
                  key={slug}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-heading text-sm font-semibold sm:text-base">
                    {tCategories(slug)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Como funciona */}
        <section id="how-it-works" className="scroll-mt-24 bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow={t("steps.eyebrow")}
              title={t("steps.title")}
            />
            <ol className="grid gap-5 md:grid-cols-3">
              {(
                [
                  { key: "register", icon: Building2 },
                  { key: "post", icon: Send },
                  { key: "receive", icon: UserRoundCheck },
                ] as const
              ).map((step, index) => (
                <li
                  key={step.key}
                  className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <step.icon className="size-5" />
                    </span>
                    <span className="font-heading text-4xl font-medium text-primary/20">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold">
                    {t(`steps.${step.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`steps.${step.key}.description`, { days })}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow={t("features.eyebrow")}
            title={t("features.title")}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((feature) => (
              <div
                key={feature.key}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="font-heading text-lg font-semibold">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Perguntas frequentes */}
        <section id="faq" className="scroll-mt-24 bg-muted/40 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
            <div className="flex flex-col gap-3">
              {faqKeys.map((key) => (
                <details
                  key={key}
                  className="group rounded-2xl border border-border bg-card px-5 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                    {t(`faq.items.${key}.question`)}
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {t(`faq.items.${key}.answer`, { days })}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-10 text-center text-ink-foreground sm:p-14">
            <Image
              src="/logo-mark.png"
              alt=""
              aria-hidden
              width={700}
              height={700}
              className="pointer-events-none absolute -right-24 -bottom-24 opacity-10"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-heading text-3xl font-medium text-balance sm:text-4xl">
                {t("finalCta.title")}
              </h2>
              <p className="mt-3 text-ink-foreground/70">
                {t("finalCta.subtitle")}
              </p>
              <Button
                size="lg"
                className="mt-7 h-12 px-6"
                render={<Link href={primaryHref} />}
              >
                {primaryLabel}
                <ArrowRight />
              </Button>

              {hasContact && (
                <div className="mt-8 border-t border-white/10 pt-6 text-sm">
                  <p className="text-ink-foreground/70">
                    {t("finalCta.contact")}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {siteContact.email && (
                      <a
                        href={`mailto:${siteContact.email}`}
                        className="inline-flex items-center gap-2 font-medium text-gold-soft underline-offset-4 hover:underline"
                      >
                        <Mail className="size-4" />
                        {siteContact.email}
                      </a>
                    )}
                    {siteContact.phone && (
                      <a
                        href={`tel:${siteContact.phone}`}
                        className="inline-flex items-center gap-2 font-medium text-gold-soft underline-offset-4 hover:underline"
                      >
                        <Phone className="size-4" />
                        {formatUsPhone(siteContact.phone)}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
