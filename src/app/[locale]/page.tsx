import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { HeroBanner } from "@/components/home/hero-banner";
import {
  ContactSection,
  SectionHeading,
  ServiceCard,
  StepsSection,
} from "@/components/home/sections";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { serviceSlugs } from "@/lib/services";

// Home da Carvalho Consulting Group. O portal de vagas fica em /services/jobs.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner
          eyebrow={t("hero.eyebrow")}
          title={t.rich("hero.title", {
            highlight: (chunks) => (
              <span className="text-primary">{chunks}</span>
            ),
          })}
          subtitle={t("hero.subtitle")}
          actions={
            <>
              <Button
                size="lg"
                className="h-12 px-6"
                render={<Link href={{ pathname: "/", hash: "services" }} />}
              >
                {t("hero.ctaPrimary")}
                <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6"
                render={<Link href="/contact" />}
              >
                {t("hero.ctaSecondary")}
              </Button>
            </>
          }
        />

        {/* Serviços */}
        <section id="services" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <SectionHeading
              eyebrow={t("services.eyebrow")}
              title={t("services.title")}
              subtitle={t("services.subtitle")}
            />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {serviceSlugs.map((slug) => (
                <li key={slug}>
                  <ServiceCard slug={slug} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <StepsSection />

        <ContactSection
          eyebrow={t("contact.eyebrow")}
          title={t("contact.title")}
          subtitle={t("contact.subtitle")}
        />
      </main>
      <Footer />
    </div>
  );
}
