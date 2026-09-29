import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { LocationSearchField } from "@/components/jobs/location-search-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const popularSearches = t.raw("popularSearches") as string[];

  return (
    <section className="relative border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--accent),transparent)]">
      {/* O corte (overflow-hidden) fica só no logo decorativo: na seção
          inteira, ele esconderia a lista de sugestões do campo de local. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={900}
          height={900}
          className="absolute -right-40 -top-40 hidden opacity-[0.05] md:block lg:-right-24"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-medium text-balance sm:text-6xl">
            {t.rich("title", {
              highlight: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground text-balance">
            {t("subtitle")}
          </p>
        </div>

        <form
          action={`/${locale}/jobs`}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xl shadow-primary/5 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder={t("searchQueryPlaceholder")}
              className="h-11 border-none pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="hidden w-px self-stretch bg-border sm:block" />
          <div className="flex-1 sm:max-w-[240px]">
            <LocationSearchField
              placeholder={t("searchLocationPlaceholder")}
              inputClassName="h-11 border-none shadow-none focus-visible:ring-0"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 sm:w-auto">
            {t("searchButton")}
          </Button>
        </form>

        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{t("popularSearchesLabel")}</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/jobs?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-border px-3 py-1 transition-colors hover:border-primary hover:text-primary"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
