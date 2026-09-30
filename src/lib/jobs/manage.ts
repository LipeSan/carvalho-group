import "server-only";

import { and, count, desc, eq, ilike, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { companies, jobApplications, jobs, type Job } from "@/db/schema";

import type { CategorySlug, ContractType, JobStatus } from "./options";
import { containsPattern } from "./queries";

// Lista de vagas das áreas de gestão (admin e empresa), com filtros e
// paginação. O escopo é obrigatório e explícito: "all" só para o admin;
// a empresa sempre passa o próprio id, então não há como esquecer o filtro
// e mostrar vagas de outra empresa.
export type JobListScope =
  { kind: "all" } | { kind: "company"; companyId: string };

export type JobListFilters = {
  q?: string;
  status?: JobStatus;
  category?: CategorySlug;
  type?: ContractType;
  page: number;
};

export type ManagedJob = Job & {
  companyName: string | null;
  applicationsCount: number;
};

export const JOB_LIST_PAGE_SIZE = 20;

export async function listJobsForManagement(
  scope: JobListScope,
  filters: JobListFilters,
): Promise<{ rows: ManagedJob[]; total: number }> {
  const conditions: SQL[] = [];
  if (scope.kind === "company") {
    conditions.push(eq(jobs.companyId, scope.companyId));
  }
  if (filters.q) conditions.push(ilike(jobs.title, containsPattern(filters.q)));
  if (filters.status) conditions.push(eq(jobs.status, filters.status));
  if (filters.category) conditions.push(eq(jobs.category, filters.category));
  if (filters.type) conditions.push(eq(jobs.contractType, filters.type));
  const where = conditions.length ? and(...conditions) : undefined;

  const applicationCounts = db
    .select({ jobId: jobApplications.jobId, n: count().as("n") })
    .from(jobApplications)
    .groupBy(jobApplications.jobId)
    .as("application_counts");

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        job: jobs,
        companyName: companies.name,
        applicationsCount:
          sql<number>`coalesce(${applicationCounts.n}, 0)`.mapWith(Number),
      })
      .from(jobs)
      .leftJoin(companies, eq(companies.id, jobs.companyId))
      .leftJoin(applicationCounts, eq(applicationCounts.jobId, jobs.id))
      .where(where)
      // Mais recentes primeiro (criação), para achar logo o que acabou de
      // ser cadastrado, publicado ou não.
      .orderBy(desc(jobs.createdAt), desc(jobs.id))
      .limit(JOB_LIST_PAGE_SIZE)
      .offset((filters.page - 1) * JOB_LIST_PAGE_SIZE),
    db.select({ total: count() }).from(jobs).where(where),
  ]);

  // companyName é nulo nas vagas criadas pelo admin (vagas da plataforma).
  return {
    rows: rows.map((row) => ({
      ...row.job,
      companyName: row.companyName,
      applicationsCount: row.applicationsCount,
    })),
    total,
  };
}
