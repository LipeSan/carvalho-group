import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  filtersToQuery,
  postedWithinOptions,
  type JobFilters,
} from "@/lib/jobs/search";
import { categorySlugs, contractTypes } from "@/lib/mock-jobs";

import { ContractTypeDot } from "./contract-type-badge";

// Filtros como links (funcionam sem JavaScript e a URL pode ser
// compartilhada). Clicar no filtro ativo o remove. Mudar um filtro volta
// para a página 1.
export function JobFilters({ filters }: { filters: JobFilters }) {
  const t = useTranslations("JobsPage");
  const tJobs = useTranslations("Jobs");
  const tCategories = useTranslations("Categories.list");

  const groups = [
    {
      key: "category" as const,
      title: t("filters.category"),
      options: categorySlugs.map((slug) => ({
        value: slug,
        label: tCategories(slug),
      })),
    },
    {
      key: "type" as const,
      title: t("filters.type"),
      options: contractTypes.map((type) => ({
        value: type,
        label: tJobs(`contractType.${type}`),
        // Mesma cor do badge no card, funcionando como legenda.
        marker: <ContractTypeDot type={type} />,
      })),
    },
    {
      key: "posted" as const,
      title: t("filters.posted"),
      options: postedWithinOptions.map((days) => ({
        value: days,
        label: t(`filters.postedWithin.${days}`),
      })),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2.5 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.options.map((option) => {
              const active = filters[group.key] === option.value;
              const query = filtersToQuery({
                ...filters,
                [group.key]: active ? undefined : option.value,
                page: 1,
              });
              return (
                <li key={option.value}>
                  <Link
                    href={{ pathname: "/jobs", query }}
                    aria-current={active ? "true" : undefined}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=true]:bg-accent aria-[current=true]:font-medium aria-[current=true]:text-accent-foreground"
                  >
                    <span className="flex items-center gap-2">
                      {"marker" in option && option.marker}
                      {option.label}
                    </span>
                    {active && <Check className="size-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
