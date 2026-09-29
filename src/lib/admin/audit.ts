import "server-only";

import { headers } from "next/headers";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export const auditActions = [
  "document.reveal",
  "user.suspend",
  "user.reactivate",
  "user.revokeSessions",
  "job.create",
  "job.update",
  "job.statusChange",
  "company.create",
  "company.approve",
  "company.reject",
] as const;

export type AuditAction = (typeof auditActions)[number];

// Registra uma ação administrativa. Nunca passe em metadata o valor de um
// documento, só qual documento foi revelado.
export async function logAudit({
  actorId,
  action,
  targetUserId,
  metadata,
}: {
  actorId: string;
  action: AuditAction;
  targetUserId?: string;
  // Para ações em vagas (jobId, title, status) e empresas (companyId, name,
  // reason), que não afetam uma conta específica.
  metadata?: Record<string, string>;
}): Promise<void> {
  const headerList = await headers();
  // Na Vercel, o primeiro IP de x-forwarded-for é o do cliente.
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    null;

  await db.insert(auditLogs).values({
    actorId,
    action,
    targetUserId,
    metadata,
    ipAddress,
  });
}
