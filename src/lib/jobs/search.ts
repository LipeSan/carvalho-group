import { isOneOf } from "@/lib/profile/options";

import {
  categorySlugs,
  contractTypes,
  type CategorySlug,
  type ContractType,
} from "./options";

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

// Monta a função que diz quais áreas combinam com uma palavra da busca,
// comparando com o nome da área no idioma da página (sem acentos).
export function categoryMatcher(
  categoryLabel: (slug: CategorySlug) => string,
): (word: string) => CategorySlug[] {
  const labels = categorySlugs.map(
    (slug) => [slug, normalize(categoryLabel(slug))] as const,
  );
  return (word) =>
    labels.filter(([, label]) => label.includes(word)).map(([slug]) => slug);
}
