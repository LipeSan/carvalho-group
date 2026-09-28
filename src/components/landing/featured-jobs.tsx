import { useTranslations } from "next-intl";
import { ArrowRight, Briefcase, Clock, Lock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { featuredJobs } from "@/lib/mock-jobs";

export function FeaturedJobs() {
  const t = useTranslations("Jobs");
  const tCategories = useTranslations("Categories.list");

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
            render={<Link href="/vagas" />}
          >
            {t("viewAll")} <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <Card
              key={job.id}
              className="flex flex-col justify-between border-border/80 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-accent text-accent-foreground"
                  >
                    {tCategories(job.categorySlug)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" />
                    {t("confidentialCompany")}
                  </span>
                </div>
                <CardTitle className="text-lg font-medium">
                  {job.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {job.location} · {t(`workMode.${job.workMode}`)}
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase className="size-4 text-primary" />
                  {t(`contractType.${job.contractType}`)}
                  {job.salaryRange ? ` · ${job.salaryRange}` : ""}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {t("postedAt", { days: job.postedAgoDays })}
                </span>
              </CardContent>
              <CardFooter>
                <Button className="w-full" render={<Link href={`/vagas/${job.id}`} />}>
                  {t("viewJob")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Button variant="outline" render={<Link href="/vagas" />}>
            {t("viewAllMobile")} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
