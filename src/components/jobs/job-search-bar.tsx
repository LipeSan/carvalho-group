import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JobFilters } from "@/lib/jobs/search";

import { LocationSearchField } from "./location-search-field";

// Formulário GET: a busca vira query string e a página é renderizada no
// servidor. Filtros ativos seguem como campos ocultos para não se perderem.
export function JobSearchBar({
  filters,
  action,
}: {
  filters: JobFilters;
  action: string;
}) {
  const t = useTranslations("JobsPage");

  return (
    <form
      // Recria os campos quando a busca da URL muda (ex.: "Limpar filtros"
      // navega sem recarregar e os inputs manteriam o texto antigo).
      key={JSON.stringify([filters.q, filters.location])}
      action={action}
      role="search"
      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-lg shadow-primary/5 sm:flex-row"
    >
      {filters.category && (
        <input type="hidden" name="category" value={filters.category} />
      )}
      {filters.type && <input type="hidden" name="type" value={filters.type} />}
      {filters.posted && (
        <input type="hidden" name="posted" value={filters.posted} />
      )}

      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={filters.q}
          placeholder={t("searchQueryPlaceholder")}
          aria-label={t("searchQueryPlaceholder")}
          className="h-11 border-none pl-9 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="hidden w-px self-stretch bg-border sm:block" />
      <div className="flex-1 sm:max-w-[240px]">
        <LocationSearchField
          defaultValue={filters.location}
          placeholder={t("searchLocationPlaceholder")}
          inputClassName="h-11 border-none shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="lg" className="h-11 sm:w-auto">
        {t("searchButton")}
      </Button>
    </form>
  );
}
