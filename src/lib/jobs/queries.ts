import "server-only";

import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import { companies, jobs } from "@/db/schema";
import { usStates } from "@/lib/profile/options";

import { toJobDetails, toPublicJob } from "./format";
import type { CategorySlug, JobDetails, PublicJob } from "./options";
import { JOBS_PER_PAGE, type JobFilters } from "./search";

const DAY_MS = 24 * 60 * 60 * 1000;

const publicColumns = {
  id: jobs.id,
  title: jobs.title,
  category: jobs.category,
  city: jobs.city,
  state: jobs.state,
  workMode: jobs.workMode,
  contractType: jobs.contractType,
  payMin: jobs.payMin,
  payMax: jobs.payMax,
  payPeriod: jobs.payPeriod,
  payNote: jobs.payNote,
  publishedAt: jobs.publishedAt,
};

// Vaga visível no site: publicada E (da plataforma, sem empresa, OU de
// empresa aprovada). Se o admin recusar uma empresa, as vagas dela saem do
// site na hora, sem precisar mexer em cada uma. É uma função (e não uma
// constante) para não tocar no banco só por importar este arquivo.
function isPublished(): SQL {
  return and(
    eq(jobs.status, "published"),
    or(
      isNull(jobs.companyId),
      inArray(
        jobs.companyId,
        db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.status, "approved")),
      ),
    ),
  )!;
}
const newestFirst = [desc(jobs.publishedAt), desc(jobs.id)];

// Escapa % e _ para a busca por texto não virar curinga.
export function containsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// Siglas dos estados cujo código ou nome combina com o texto.
function matchingStateCodes(text: string, exact = false): string[] {
  const query = normalize(text);
  return Object.entries(usStates)
    .filter(([code, name]) =>
      exact
        ? code.toLowerCase() === query || normalize(name) === query
        : code.toLowerCase() === query || normalize(name).includes(query),
    )
    .map(([code]) => code);
}

// "Orlando", "FL" ou "Florida" encontram vagas em Orlando, FL. "Orlando, FL"
// (formato do autocomplete da busca) exige a cidade E o estado, para não
// trazer uma Orlando de outro estado.
function locationCondition(location: string): SQL {
  const [cityPart, statePart, ...rest] = location
    .split(",")
    .map((part) => part.trim());
  if (cityPart && statePart && rest.length === 0) {
    const codes = matchingStateCodes(statePart, true);
    if (codes.length) {
      return and(
        ilike(jobs.city, containsPattern(cityPart)),
        inArray(jobs.state, codes),
      )!;
    }
  }

  const stateCodes = matchingStateCodes(location);
  return or(
    ilike(jobs.city, containsPattern(location)),
    ...(stateCodes.length ? [inArray(jobs.state, stateCodes)] : []),
  )!;
}

// Cada palavra da busca precisa aparecer no título ou no nome da área (no
// idioma da página, ex.: "cozinheiro" encontra as vagas de Cook).
function keywordCondition(
  q: string,
  categoriesMatching: (word: string) => CategorySlug[],
): SQL {
  const words = q.split(/\s+/).filter(Boolean);
  return and(
    ...words.map((word) => {
      const categories = categoriesMatching(normalize(word));
      return or(
        ilike(jobs.title, containsPattern(word)),
        ...(categories.length ? [inArray(jobs.category, categories)] : []),
      )!;
    }),
  )!;
}

export async function searchPublishedJobs(
  filters: JobFilters,
  categoriesMatching: (word: string) => CategorySlug[],
): Promise<{
  jobs: PublicJob[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const conditions: SQL[] = [isPublished()];
  if (filters.category) conditions.push(eq(jobs.category, filters.category));
  if (filters.type) conditions.push(eq(jobs.contractType, filters.type));
  if (filters.posted) {
    const since = new Date(Date.now() - Number(filters.posted) * DAY_MS);
    conditions.push(gte(jobs.publishedAt, since));
  }
  if (filters.location) conditions.push(locationCondition(filters.location));
  if (filters.q)
    conditions.push(keywordCondition(filters.q, categoriesMatching));
  const where = and(...conditions);

  const [{ total }] = await db
    .select({ total: count() })
    .from(jobs)
    .where(where);
  const totalPages = Math.max(1, Math.ceil(total / JOBS_PER_PAGE));
  const page = Math.min(filters.page, totalPages);

  const rows = await db
    .select(publicColumns)
    .from(jobs)
    .where(where)
    .orderBy(...newestFirst)
    .limit(JOBS_PER_PAGE)
    .offset((page - 1) * JOBS_PER_PAGE);

  return { jobs: rows.map(toPublicJob), total, page, totalPages };
}

// Só vagas publicadas: rascunhos e encerradas dão 404 no site.
export async function getPublishedJob(id: number): Promise<JobDetails | null> {
  const [row] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), isPublished()))
    .limit(1);
  return row ? toJobDetails(row) : null;
}

export async function getSimilarJobs(
  job: Pick<PublicJob, "id" | "categorySlug">,
  limit = 3,
): Promise<PublicJob[]> {
  const rows = await db
    .select(publicColumns)
    .from(jobs)
    .where(
      and(
        isPublished(),
        eq(jobs.category, job.categorySlug),
        ne(jobs.id, Number(job.id)),
      ),
    )
    .orderBy(...newestFirst)
    .limit(limit);
  return rows.map(toPublicJob);
}

export async function getFeaturedJobs(limit = 6): Promise<PublicJob[]> {
  const rows = await db
    .select(publicColumns)
    .from(jobs)
    .where(isPublished())
    .orderBy(...newestFirst)
    .limit(limit);
  return rows.map(toPublicJob);
}

// Quantidade de vagas publicadas por área (home, "Busque por área").
export async function getPublishedCountsByCategory(): Promise<
  Partial<Record<CategorySlug, number>>
> {
  const rows = await db
    .select({ category: jobs.category, total: count() })
    .from(jobs)
    .where(isPublished())
    .groupBy(jobs.category);
  return Object.fromEntries(rows.map((row) => [row.category, row.total]));
}

// Total de vagas no site (números da home e da página para empresas).
export async function getPublishedJobCount(): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(jobs)
    .where(isPublished());
  return total;
}
