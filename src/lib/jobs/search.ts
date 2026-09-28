import {
  allJobs,
  categorySlugs,
  contractTypes,
  type CategorySlug,
  type ContractType,
  type PublicJob,
} from "@/lib/mock-jobs";
import { isOneOf, usStates } from "@/lib/profile/options";

// Filtros da página /jobs, lidos da URL. Tudo opcional.
export type JobFilters = {
  q?: string;
  location?: string;
  category?: CategorySlug;
  type?: ContractType;
  posted?: PostedWithin;
  page: number;
};

export const postedWithinOptions = ["1", "7", "30"] as const;
export type PostedWithin = (typeof postedWithinOptions)[number];

export const JOBS_PER_PAGE = 10;

function param(value: string | string[] | undefined): string | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  const trimmed = single?.trim();
  return trimmed ? trimmed.slice(0, 100) : undefined;
}

// Valores inválidos na URL são ignorados em vez de gerar erro.
export function parseJobFilters(
  searchParams: Record<string, string | string[] | undefined>,
): JobFilters {
  const category = param(searchParams.category);
  const type = param(searchParams.type);
  const posted = param(searchParams.posted);
  const page = Number(param(searchParams.page));

  return {
    q: param(searchParams.q),
    location: param(searchParams.location),
    category: isOneOf(categorySlugs, category) ? category : undefined,
    type: isOneOf(contractTypes, type) ? type : undefined,
    posted: isOneOf(postedWithinOptions, posted) ? posted : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

// Transforma os filtros em query string, omitindo os vazios. A página 1 não
// aparece na URL.
export function filtersToQuery(
  filters: Partial<JobFilters>,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.q) query.q = filters.q;
  if (filters.location) query.location = filters.location;
  if (filters.category) query.category = filters.category;
  if (filters.type) query.type = filters.type;
  if (filters.posted) query.posted = filters.posted;
  if (filters.page && filters.page > 1) query.page = String(filters.page);
  return query;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// "Orlando", "FL" ou "Florida" encontram vagas em "Orlando, FL".
function matchesLocation(job: PublicJob, location: string): boolean {
  const query = normalize(location);
  const [city = "", state = ""] = job.location.split(",").map((s) => s.trim());
  const stateName = usStates[state as keyof typeof usStates] ?? "";
  return (
    normalize(job.location).includes(query) ||
    normalize(city).includes(query) ||
    normalize(state) === query ||
    normalize(stateName).includes(query)
  );
}

// Busca por palavra-chave no título e no nome da área (no idioma da página).
// Quando as vagas vierem do banco, esta função vira uma consulta com os
// mesmos filtros e a página não precisa mudar.
export function searchJobs(
  filters: JobFilters,
  categoryLabel: (slug: CategorySlug) => string,
): { jobs: PublicJob[]; total: number; page: number; totalPages: number } {
  const query = filters.q ? normalize(filters.q) : undefined;

  const matching = allJobs
    .filter((job) => {
      if (filters.category && job.categorySlug !== filters.category) {
        return false;
      }
      if (filters.type && job.contractType !== filters.type) return false;
      if (filters.posted && job.postedAgoDays > Number(filters.posted)) {
        return false;
      }
      if (filters.location && !matchesLocation(job, filters.location)) {
        return false;
      }
      if (query) {
        const haystack = normalize(
          `${job.title} ${categoryLabel(job.categorySlug)}`,
        );
        // Todas as palavras precisam aparecer, em qualquer ordem.
        return query.split(/\s+/).every((word) => haystack.includes(word));
      }
      return true;
    })
    .sort((a, b) => a.postedAgoDays - b.postedAgoDays);

  const total = matching.length;
  const totalPages = Math.max(1, Math.ceil(total / JOBS_PER_PAGE));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * JOBS_PER_PAGE;

  return {
    jobs: matching.slice(start, start + JOBS_PER_PAGE),
    total,
    page,
    totalPages,
  };
}
