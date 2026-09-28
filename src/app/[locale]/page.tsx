import { setRequestLocale } from "next-intl/server";

import { EmployerCta } from "@/components/landing/employer-cta";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { JobCategories } from "@/components/landing/job-categories";
import { Navbar } from "@/components/landing/navbar";
import { StatsBar } from "@/components/landing/stats-bar";

export default async function Home({
  params,
}: PageProps<"/[locale]">) {
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
