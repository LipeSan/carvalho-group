import { useTranslations } from "next-intl";
import { Banknote, Clock, Lock, MapPin } from "lucide-react";

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
import type { PublicJob } from "@/lib/jobs/options";

import { ContractTypeBadge } from "./contract-type-badge";

// Card de vaga usado na home (vagas em destaque) e na listagem /jobs.
export function JobCard({ job }: { job: PublicJob }) {
  const t = useTranslations("Jobs");
  const tCategories = useTranslations("Categories.list");

  return (
    <Card className="flex flex-col justify-between border-border/80 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground"
            >
              {tCategories(job.categorySlug)}
            </Badge>
            <ContractTypeBadge type={job.contractType} />
          </div>
          <span className="flex shrink-0 items-center gap-1 pt-0.5 text-xs text-muted-foreground">
            <Lock className="size-3" />
            {t("confidentialCompany")}
          </span>
        </div>
        <CardTitle className="text-lg font-medium">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" />
          {job.location} · {t(`workMode.${job.workMode}`)}
        </span>
        {job.salaryRange && (
          <span className="flex items-center gap-2">
            <Banknote className="size-4 shrink-0 text-primary" />
            {job.salaryRange}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" />
          {job.postedAgoDays === 0
            ? t("postedToday")
            : t("postedAt", { days: job.postedAgoDays })}
        </span>
      </CardContent>
      <CardFooter>
        <Button className="w-full" render={<Link href={`/jobs/${job.id}`} />}>
          {t("viewJob")}
        </Button>
      </CardFooter>
    </Card>
  );
}
