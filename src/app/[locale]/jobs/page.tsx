import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ChevronLeft,
  ChevronRight,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  filtersToQuery,
  categoryMatcher,
  parseJobFilters,
  type JobFilters as Filters,
} from "@/lib/jobs/search";
import { searchPublishedJobs } from "@/lib/jobs/queries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/jobs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "JobsPage" });

  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function JobsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/jobs">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("JobsPage");
  const tJobs = await getTranslations("Jobs");
  const tCategories = await getTranslations("Categories.list");

  const filters = parseJobFilters(await searchParams);
  const { jobs, total, page, totalPages } = await searchPublishedJobs(
    filters,
    categoryMatcher((slug) => tCategories(slug)),
  );

  const hrefWith = (overrides: Partial<Filters>) => ({
    pathname: "/jobs" as const,
    query: filtersToQuery({ ...filters, ...overrides }),
  });

  // Chips dos filtros ativos, cada um com link para removê-lo.
  const activeFilters = [
    filters.q && { key: "q", label: `“${filters.q}”` },
    filters.location && { key: "location", label: filters.location },
    filters.category && {
      key: "category",
      label: tCategories(filters.category),
    },
    filters.type && {
      key: "type",
      label: tJobs(`contractType.${filters.type}`),
    },
    filters.posted && {
      key: "posted",
      label: t(`filters.postedWithin.${filters.posted}`),
    },
  ].filter((item): item is { key: keyof Filters; label: string } =>
    Boolean(item),
  );

  const filterPanel = <JobFilters filters={filters} />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--accent),transparent)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="font-heading text-3xl font-medium sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-6">
            <JobSearchBar filters={filters} action={`/${locale}/jobs`} />
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label={t("filters.title")}>
          {filterPanel}
        </aside>

        <div className="min-w-0">
          {/* No celular os filtros ficam recolhidos. */}
          <details className="group mb-6 rounded-xl border border-border bg-card lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
              <SlidersHorizontal className="size-4" />
              {t("filters.title")}
              {activeFilters.length > 0 && (
                <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">
                  {activeFilters.length}
                </span>
              )}
            </summary>
            <div className="border-t border-border px-2 py-4">
              {filterPanel}
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-2">
            <p
              className="mr-2 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {t("resultsCount", { count: total })}
            </p>
            {activeFilters.map((filter) => (
              <Link
                key={filter.key}
                href={hrefWith({ [filter.key]: undefined, page: 1 })}
                aria-label={t("removeFilter", { filter: filter.label })}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 py-1 pr-2 pl-3 text-sm text-foreground transition-colors hover:border-primary"
              >
                {filter.label}
                <X className="size-3.5 text-muted-foreground" />
              </Link>
            ))}
            {activeFilters.length > 1 && (
              <Link
                href="/jobs"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("clearFilters")}
              </Link>
            )}
          </div>

          {jobs.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="size-5 text-muted-foreground" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-medium">
                {t("emptyTitle")}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {t("emptyText")}
              </p>
              {activeFilters.length > 0 && (
                <Button
                  variant="outline"
                  className="mt-5"
                  render={<Link href="/jobs" />}
                >
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label={t("pagination")}
              className="mt-10 flex items-center justify-center gap-1"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("previousPage")}
                disabled={page <= 1}
                render={
                  page > 1 ? (
                    <Link href={hrefWith({ page: page - 1 })} />
                  ) : undefined
                }
              >
                <ChevronLeft />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === page ? "default" : "ghost"}
                  size="icon"
                  aria-current={n === page ? "page" : undefined}
                  render={<Link href={hrefWith({ page: n })} />}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nextPage")}
                disabled={page >= totalPages}
                render={
                  page < totalPages ? (
                    <Link href={hrefWith({ page: page + 1 })} />
                  ) : undefined
                }
              >
                <ChevronRight />
              </Button>
            </nav>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
