import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  CalendarClock,
  Check,
  Clock,
  Gift,
  ListChecks,
  Lock,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import { ContractTypeBadge } from "@/components/jobs/contract-type-badge";
import { JobCard } from "@/components/jobs/job-card";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getJobById, getSimilarJobs } from "@/lib/jobs/details";
import { getCandidateProfile } from "@/lib/profile/queries";
import { firstIncompleteStep } from "@/lib/profile/steps";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/jobs/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const job = getJobById(id);
  if (!job) return {};

  const t = await getTranslations({ locale, namespace: "JobDetail" });
  return {
    title: t("metaTitle", { title: job.title, location: job.location }),
    description: job.description,
  };
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-heading text-xl font-medium">
        <Icon className="size-5 text-primary" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-muted-foreground"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function JobDetailPage({
  params,
}: PageProps<"/[locale]/jobs/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const job = getJobById(id);
  if (!job) notFound();

  const t = await getTranslations("JobDetail");
  const tJobs = await getTranslations("Jobs");
  const tCategories = await getTranslations("Categories.list");

  const similarJobs = getSimilarJobs(job);
  const postedLabel =
    job.postedAgoDays === 0
      ? tJobs("postedToday")
      : tJobs("postedAt", { days: job.postedAgoDays });

  // A candidatura ainda não existe: o botão leva cada pessoa ao próximo passo
  // que ela precisa dar (entrar, completar o perfil) ou avisa que vem aí.
  const user = await getCurrentUser();
  const profileIncomplete =
    user?.role === "candidate" &&
    firstIncompleteStep(await getCandidateProfile(user.id)) !== null;

  let applyAction: React.ReactNode;
  if (!user) {
    applyAction = (
      <>
        <Button
          size="lg"
          className="h-11 w-full"
          render={
            <Link
              href={{
                pathname: "/sign-in",
                query: { next: `/jobs/${job.id}` },
              }}
            />
          }
        >
          {t("apply")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("signInToApply")}
        </p>
      </>
    );
  } else if (user.role === "employer") {
    applyAction = (
      <p className="text-center text-sm text-muted-foreground">
        {t("employersCannotApply")}
      </p>
    );
  } else if (profileIncomplete) {
    applyAction = (
      <>
        <Button
          size="lg"
          className="h-11 w-full"
          render={<Link href="/profile" />}
        >
          {t("completeProfile")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("completeProfileHint")}
        </p>
      </>
    );
  } else {
    applyAction = (
      <>
        <Button size="lg" className="h-11 w-full" disabled>
          {t("apply")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("applyComingSoon")}
        </p>
      </>
    );
  }

  const summary = [
    { icon: Banknote, label: t("salary"), value: job.salaryRange ?? "—" },
    {
      icon: Briefcase,
      label: t("jobType"),
      value: tJobs(`contractType.${job.contractType}`),
    },
    {
      icon: MapPin,
      label: t("location"),
      value: `${job.location} · ${tJobs(`workMode.${job.workMode}`)}`,
    },
    { icon: CalendarClock, label: t("schedule"), value: job.schedule },
    { icon: Clock, label: t("posted"), value: postedLabel },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--accent),transparent)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backToJobs")}
          </Link>

          <div className="mt-6 flex flex-wrap gap-1.5">
            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground"
              render={
                <Link
                  href={{
                    pathname: "/jobs",
                    query: { category: job.categorySlug },
                  }}
                />
              }
            >
              {tCategories(job.categorySlug)}
            </Badge>
            <ContractTypeBadge type={job.contractType} />
          </div>

          <h1 className="mt-3 font-heading text-3xl font-medium text-balance sm:text-4xl">
            {job.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              {job.location}
            </span>
            {job.salaryRange && (
              <span className="flex items-center gap-1.5">
                <Banknote className="size-4 text-primary" />
                {job.salaryRange}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              {postedLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-4 text-primary" />
              {tJobs("confidentialCompany")}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        {/* No celular o resumo e o botão vêm antes do texto da vaga. */}
        <aside className="lg:order-last">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-28">
            <dl className="flex flex-col gap-4">
              {summary.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-2 border-t border-border pt-5">
              {applyAction}
            </div>
          </div>
        </aside>

        <article className="flex min-w-0 flex-col gap-9">
          <Section icon={Briefcase} title={t("aboutRole")}>
            <p className="leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </Section>
          <Section icon={ListChecks} title={t("responsibilities")}>
            <CheckList items={job.responsibilities} />
          </Section>
          <Section icon={Check} title={t("requirements")}>
            <CheckList items={job.requirements} />
          </Section>
          <Section icon={Gift} title={t("benefits")}>
            <CheckList items={job.benefits} />
          </Section>

          <div className="flex items-start gap-2.5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>{t("confidentialNote")}</p>
          </div>
        </article>
      </main>

      {similarJobs.length > 0 && (
        <section className="bg-muted/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-medium">
              {t("similarJobs")}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similarJobs.map((similar) => (
                <JobCard key={similar.id} job={similar} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
