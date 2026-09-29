import "server-only";

import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs, type Job } from "@/db/schema";

export async function getJobForCompany(
  companyId: string,
  jobId: number,
): Promise<Job | null> {
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.companyId, companyId)))
    .limit(1);
  return job ?? null;
}

export async function countJobsByStatus(companyId: string) {
  const rows = await db
    .select({ status: jobs.status, total: count() })
    .from(jobs)
    .where(eq(jobs.companyId, companyId))
    .groupBy(jobs.status);
  return Object.fromEntries(
    rows.map((row) => [row.status, row.total]),
  ) as Partial<Record<Job["status"], number>>;
}
