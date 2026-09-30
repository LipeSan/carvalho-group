import "server-only";

import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { companies, jobApplications, users } from "@/db/schema";
import { getPublishedJobCount } from "@/lib/jobs/queries";

// Números públicos da plataforma, sempre vindos do banco. Nunca coloque
// valores fixos aqui: número inventado em página de venda é propaganda
// enganosa (FTC).
export async function getPlatformStats() {
  const [activeJobs, [companyRow], [candidateRow], [hireRow]] =
    await Promise.all([
      getPublishedJobCount(),
      db
        .select({ total: count() })
        .from(companies)
        .where(eq(companies.status, "approved")),
      db
        .select({ total: count() })
        .from(users)
        .where(and(eq(users.role, "candidate"), eq(users.status, "active"))),
      db
        .select({ total: count() })
        .from(jobApplications)
        .where(eq(jobApplications.status, "hired")),
    ]);

  return {
    activeJobs,
    partnerCompanies: companyRow.total,
    registeredCandidates: candidateRow.total,
    hires: hireRow.total,
  };
}
