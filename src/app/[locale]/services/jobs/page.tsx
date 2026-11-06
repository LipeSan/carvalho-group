import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EmployerCta } from "@/components/landing/employer-cta";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { JobCategories } from "@/components/landing/job-categories";
import { Navbar } from "@/components/landing/navbar";
import { StatsBar } from "@/components/landing/stats-bar";

// Home do portal de vagas (Carvalho Group Jobs), um dos serviços do grupo.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services/jobs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("jobsTitle"), description: t("jobsDescription") };
}

export default async function JobsHome({
  params,
}: PageProps<"/[locale]/services/jobs">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <JobCategories />
        <FeaturedJobs />
        <EmployerCta />
      </main>
      <Footer />
    </div>
  );
}
