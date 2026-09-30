import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobApplications } from "@/db/schema";

// Candidatura do candidato a uma vaga, ou null se ainda não se candidatou.
export async function getApplication(jobId: number, candidateId: string) {
  const [row] = await db
    .select({ id: jobApplications.id, createdAt: jobApplications.createdAt })
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.jobId, jobId),
        eq(jobApplications.candidateId, candidateId),
      ),
    )
    .limit(1);
  return row ?? null;
}

// Idempotente: clicar duas vezes (ou em duas abas) não cria outra candidatura.
export async function createApplication(jobId: number, candidateId: string) {
  await db
    .insert(jobApplications)
    .values({ jobId, candidateId })
    .onConflictDoNothing({
      target: [jobApplications.jobId, jobApplications.candidateId],
    });
}
