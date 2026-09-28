import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { featuredJobs } from "@/lib/mock-jobs";

export function FeaturedJobs() {
  const t = useTranslations("Jobs");

  return (
    <section className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            render={<Link href="/jobs" />}
          >
            {t("viewAll")} <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Button variant="outline" render={<Link href="/jobs" />}>
            {t("viewAllMobile")} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
