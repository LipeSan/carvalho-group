import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Eye, Target } from "lucide-react";

import {
  ContactSection,
  SectionHeading,
  StepsSection,
} from "@/components/home/sections";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

type Value = { title: string; description: string };

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tHome] = await Promise.all([
    getTranslations("About"),
    getTranslations("Home"),
  ]);
  const paragraphs = t.raw("paragraphs") as string[];
  const mission = t.raw("mission") as string[];
  const vision = t.raw("vision") as string[];
  const values = t.raw("values") as Value[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Abertura */}
        <section className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--accent),transparent)]">
          <Image
            src="/logo-mark.png"
            alt=""
            aria-hidden
            width={900}
            height={900}
            className="pointer-events-none absolute -top-40 -right-40 hidden opacity-[0.05] md:block lg:-right-24"
            priority
          />
          <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              {t("eyebrow")}
            </span>
            <h1 className="mt-6 font-heading text-4xl font-medium text-balance sm:text-6xl">
              {t("title")}
            </h1>
            <div className="mt-6 flex flex-col gap-4 text-lg text-muted-foreground">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Button
              size="lg"
              className="mt-9 h-12 px-6"
              render={<Link href={{ pathname: "/", hash: "services" }} />}
            >
              {tHome("hero.ctaPrimary")}
              <ArrowRight />
            </Button>
          </div>
        </section>

        {/* Missão e visão */}
        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-20 sm:px-6 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground sm:p-10">
            <Target
              aria-hidden
              className="absolute -right-6 -bottom-6 size-40 text-white/5"
            />
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-gold-soft">
              <Target className="size-5" />
            </span>
            <h2 className="mt-6 font-heading text-3xl font-medium">
              {t("missionTitle")}
            </h2>
            <div className="relative mt-4 flex flex-col gap-4 text-ink-foreground/75">
              {mission.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <article className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-10">
            <Eye
              aria-hidden
              className="absolute -right-6 -bottom-6 size-40 text-primary/5"
            />
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Eye className="size-5" />
            </span>
            <h2 className="mt-6 font-heading text-3xl font-medium">
              {t("visionTitle")}
            </h2>
            <div className="relative mt-4 flex flex-col gap-4 text-muted-foreground">
              {vision.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </section>

        {/* Valores: título fixo à esquerda, lista numerada à direita. */}
        <section className="border-t border-border/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                align="start"
                eyebrow={t("valuesEyebrow")}
                title={t("valuesTitle")}
              />
            </div>
            <ol className="flex flex-col divide-y divide-border/80 border-y border-border/80">
              {values.map((value, index) => (
                <li
                  key={value.title}
                  className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[4rem_1fr]"
                >
                  <span className="font-heading text-3xl font-medium text-primary sm:text-4xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl font-medium">
                      {value.title}
                    </h3>
                    <p className="mt-1.5 text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <StepsSection />

        <ContactSection
          eyebrow={tHome("contact.eyebrow")}
          title={tHome("contact.title")}
          subtitle={tHome("contact.subtitle")}
        />
      </main>
      <Footer />
    </div>
  );
}
