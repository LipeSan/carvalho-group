import { useTranslations } from "next-intl";

import {
  FilterBar,
  pageParam,
  pickParam,
  textParam,
} from "@/components/lists/list-controls";
import type { JobListFilters } from "@/lib/jobs/manage";
import { categorySlugs, contractTypes, jobStatuses } from "@/lib/jobs/options";

// Lê os filtros da lista de vagas da URL (valores desconhecidos são
// ignorados). Usado no admin e na área da empresa.
export function parseJobListFilters(
  sp: Record<string, string | string[] | undefined>,
): JobListFilters {
  return {
    q: textParam(sp.q),
    status: pickParam(sp.status, jobStatuses),
    category: pickParam(sp.category, categorySlugs),
    type: pickParam(sp.type, contractTypes),
    page: pageParam(sp.page),
  };
}

// Barra de filtros da lista de vagas: busca pelo título, status, área e
// tipo de contrato.
export function JobListFilterBar({
  path,
  filters,
}: {
  path: string;
  filters: JobListFilters;
}) {
  const tForm = useTranslations("JobForm");
  const tCategories = useTranslations("Categories.list");
  const tJobs = useTranslations("Jobs");
  const tTable = useTranslations("JobsTable");

  return (
    <FilterBar
      path={path}
      query={filters.q}
      searchPlaceholder={tTable("searchPlaceholder")}
      selects={[
        {
          name: "status",
          label: tForm("fields.status"),
          value: filters.status,
          options: jobStatuses.map((status) => ({
            value: status,
            label: tForm(`status.${status}`),
          })),
        },
        {
          name: "category",
          label: tForm("fields.category"),
          value: filters.category,
          options: categorySlugs.map((slug) => ({
            value: slug,
            label: tCategories(slug),
          })),
        },
        {
          name: "type",
          label: tForm("fields.contractType"),
          value: filters.type,
          options: contractTypes.map((type) => ({
            value: type,
            label: tJobs(`contractType.${type}`),
          })),
        },
      ]}
    />
  );
}
