import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { cn } from "cn";

import {
  ContactSection,
  SectionHeading,
  ServiceCard,
  StepsSection,
} from "@/components/home/sections";
import { HeroBanner } from "@/components/home/hero-banner";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { SERVICE_ICONS } from "@/components/services/service-icon";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  consultingServiceSlugs,
  isConsultingServiceSlug,
  serviceBannerImages,
  serviceSlugs,
} from "@/lib/services";

// Páginas dos serviços de consultoria. O portal de vagas tem rota própria
// (/services/jobs), que tem prioridade sobre esta rota dinâmica.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    consultingServiceSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isConsultingServiceSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "Services.items" });
  return {
    title: `${t(`${slug}.name`)} | Carvalho Consulting Group`,
    description: t(`${slug}.subtitle`),
  };
}

type Offering = { title: string; description: string };
// `note`: observação em letra menor ao final da área (ex.: condições).
type Area = { title: string; items: string[]; note?: string };

// Campos que nem todo serviço tem. Serviço com `areas` mostra as áreas de
// atuação detalhadas; sem elas, mostra os cards de `offerings`.
type ServiceExtras = {
  // Texto do selo do banner, quando difere do nome curto usado no menu.
  eyebrow?: string;
  tagline?: string;
  // Título da seção de áreas, quando o padrão (empresas) não serve.
  areasTitle?: string;
  areas?: Area[];
  offerings?: Offering[];
  purpose?: string;
};

export default async function ServicePage({
  params,
}: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  if (!isConsultingServiceSlug(slug)) notFound();
  setRequestLocale(locale);

  const [t, messages] = await Promise.all([
    getTranslations("Services"),
    getMessages(),
  ]);
  const extras = (messages.Services.items as Record<string, ServiceExtras>)[
    slug
  ];
  const audience = t.raw(`items.${slug}.audience`) as string[];
  const Icon = SERVICE_ICONS[slug];
  const otherServices = serviceSlugs.filter((other) => other !== slug);
  const bannerImage = serviceBannerImages[slug];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner
          eyebrow={
            <>
              <Icon className="size-3.5" />
              {extras.eyebrow ?? t(`items.${slug}.name`)}
            </>
          }
          title={t.rich(`items.${slug}.title`, {
            highlight: (chunks) => (
              <span className="text-primary">{chunks}</span>
            ),
          })}
          tagline={extras.tagline}
          compactTitle={Boolean(extras.areas)}
          subtitle={t(`items.${slug}.subtitle`)}
          image={
            bannerImage
              ? { src: bannerImage, alt: t(`items.${slug}.imageAlt`) }
              : undefined
          }
          actions={
            <>
              <Button
                size="lg"
                className="h-12 px-6"
                render={<a href="#offerings" />}
              >
                {t("page.ctaOfferings")}
                <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6"
                render={
                  <Link
                    href={{ pathname: "/contact", query: { service: slug } }}
                  />
                }
              >
                {t("page.ctaButton")}
              </Button>
            </>
          }
        />

        {/* Para quem é */}
        <section className="border-b border-border/70 bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <p className="text-center text-xs font-semibold tracking-[0.2em] text-primary uppercase lg:text-left">
              {t("page.audienceTitle")}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {audience.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {extras.areas ? (
          /* Áreas de atuação, numeradas, cada uma com a sua lista. */
          <section
            id="offerings"
            className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6"
          >
            <SectionHeading
              eyebrow={t("page.areasEyebrow")}
              title={extras.areasTitle ?? t("page.areasTitle")}
            />
            <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {extras.areas.map((area, index, all) => {
                // Se a última área ficaria sozinha na linha, ela ocupa a
                // largura toda e a lista vira colunas.
                const isLast = index === all.length - 1;
                const wideMd = isLast && all.length % 2 === 1;
                const wideLg = isLast && all.length % 3 === 1;
                return (
                  <li
                    key={area.title}
                    className={cn(
                      "flex flex-col rounded-2xl border border-border/80 bg-card p-6",
                      wideMd && "md:col-span-2",
                      wideLg ? "lg:col-span-3" : wideMd && "lg:col-span-1",
                    )}
                  >
                    <div className="flex items-baseline gap-3 border-b border-border/70 pb-4">
                      <span className="font-heading text-3xl font-medium text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-xl leading-snug font-medium">
                        {area.title}
                      </h3>
                    </div>
                    <ul
                      className={cn(
                        "mt-4 flex flex-col gap-2",
                        wideMd && "md:grid md:grid-cols-2 md:gap-x-8",
                        wideLg && "lg:grid lg:grid-cols-3",
                        !wideLg && wideMd && "lg:flex",
                      )}
                    >
                      {area.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {area.note && (
                      <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground/80 italic">
                        {area.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ) : (
          /* O que fazemos */
          <section
            id="offerings"
            className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6"
          >
            <SectionHeading
              eyebrow={t("page.offeringsEyebrow")}
              title={t("page.offeringsTitle")}
            />
            <ul className="grid gap-5 sm:grid-cols-2">
              {(extras.offerings ?? []).map((offering) => (
                <li
                  key={offering.title}
                  className="rounded-2xl border border-border/80 bg-card p-6"
                >
                  <h3 className="font-heading text-xl font-medium">
                    {offering.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {offering.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {extras.purpose && (
          <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-12 text-center text-ink-foreground sm:px-14 sm:py-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-gold-soft uppercase">
                {t("page.purposeTitle")}
              </span>
              <p className="mx-auto mt-4 max-w-3xl font-heading text-2xl leading-snug font-medium text-balance sm:text-3xl">
                {extras.purpose}
              </p>
            </div>
          </section>
        )}

        <StepsSection />

        <ContactSection
          service={slug}
          eyebrow={t(`items.${slug}.name`)}
          title={t("page.ctaTitle")}
          subtitle={t("page.ctaSubtitle")}
        />

        {/* Outros serviços */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="mb-6 font-heading text-2xl font-medium">
            {t("page.otherServices")}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-3">
            {otherServices.map((other) => (
              <li key={other}>
                <ServiceCard slug={other} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
