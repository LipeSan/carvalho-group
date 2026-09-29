import "server-only";

import {
  and,
  count,
  desc,
  eq,
  gt,
  ilike,
  isNotNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { auditLogs, candidateProfiles, sessions, users } from "@/db/schema";
import {
  safeProfileColumns,
  type SafeCandidateProfile,
} from "@/lib/profile/queries";

export const ADMIN_PAGE_SIZE = 20;

// Mesmo critério de getProfileCompletion (src/lib/profile/steps.ts), em SQL.
const profileComplete = sql<boolean>`(
  ${candidateProfiles.phone} is not null and ${candidateProfiles.city} is not null
  and ${candidateProfiles.state} is not null and ${candidateProfiles.zip} is not null
  and ${candidateProfiles.desiredRole} is not null and ${candidateProfiles.education} is not null
  and ${candidateProfiles.workAuthorized} is not null and ${candidateProfiles.needsSponsorship} is not null
)`;

// Escapa % e _ para a busca por texto não virar curinga.
function containsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

function pageOffset(page: number): number {
  return (page - 1) * ADMIN_PAGE_SIZE;
}

// ---------------------------------------------------------------------------
// Painel

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getDashboardStats() {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * DAY_MS);
  const twoWeeksAgo = new Date(now - 14 * DAY_MS);
  const isCandidate = eq(users.role, "candidate");

  const [[totals], byState, byRole] = await Promise.all([
    db
      .select({
        candidates: count(),
        newThisWeek:
          sql<number>`count(*) filter (where ${users.createdAt} >= ${weekAgo})`.mapWith(
            Number,
          ),
        newLastWeek:
          sql<number>`count(*) filter (where ${users.createdAt} >= ${twoWeeksAgo} and ${users.createdAt} < ${weekAgo})`.mapWith(
            Number,
          ),
        completeProfiles:
          sql<number>`count(*) filter (where ${profileComplete})`.mapWith(
            Number,
          ),
        suspended:
          sql<number>`count(*) filter (where ${users.status} = 'suspended')`.mapWith(
            Number,
          ),
      })
      .from(users)
      .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
      .where(isCandidate),
    db
      .select({ key: candidateProfiles.state, value: count() })
      .from(candidateProfiles)
      .innerJoin(users, eq(users.id, candidateProfiles.userId))
      .where(and(isCandidate, isNotNull(candidateProfiles.state)))
      .groupBy(candidateProfiles.state)
      .orderBy(desc(count()), candidateProfiles.state)
      .limit(8),
    db
      .select({ key: candidateProfiles.desiredRole, value: count() })
      .from(candidateProfiles)
      .innerJoin(users, eq(users.id, candidateProfiles.userId))
      .where(and(isCandidate, isNotNull(candidateProfiles.desiredRole)))
      .groupBy(candidateProfiles.desiredRole)
      .orderBy(desc(count()), candidateProfiles.desiredRole)
      .limit(8),
  ]);

  return {
    ...totals,
    byState: byState as { key: string; value: number }[],
    byRole: byRole as { key: string; value: number }[],
  };
}

// ---------------------------------------------------------------------------
// Candidatos

export type CandidateFilters = {
  q?: string;
  state?: string;
  role?: string;
  authorized?: "yes" | "no";
  profile?: "complete" | "incomplete";
  status?: "active" | "suspended";
  page: number;
};

export async function listCandidates(filters: CandidateFilters) {
  const conditions: SQL[] = [eq(users.role, "candidate")];
  if (filters.q) {
    const pattern = containsPattern(filters.q);
    conditions.push(
      or(ilike(users.name, pattern), ilike(users.email, pattern))!,
    );
  }
  if (filters.state)
    conditions.push(eq(candidateProfiles.state, filters.state));
  if (filters.role)
    conditions.push(eq(candidateProfiles.desiredRole, filters.role));
  if (filters.authorized) {
    conditions.push(
      eq(candidateProfiles.workAuthorized, filters.authorized === "yes"),
    );
  }
  if (filters.profile === "complete") conditions.push(profileComplete);
  if (filters.profile === "incomplete")
    conditions.push(sql`not coalesce(${profileComplete}, false)`);
  if (filters.status) conditions.push(eq(users.status, filters.status));
  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
        city: candidateProfiles.city,
        state: candidateProfiles.state,
        desiredRole: candidateProfiles.desiredRole,
        workAuthorized: candidateProfiles.workAuthorized,
        complete: sql<boolean>`coalesce(${profileComplete}, false)`,
      })
      .from(users)
      .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset(pageOffset(filters.page)),
    db
      .select({ total: count() })
      .from(users)
      .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
      .where(where),
  ]);

  return { rows, total };
}

// Perfil completo de um candidato, sem os documentos criptografados (esses só
// saem pela action de revelar, que registra auditoria).
export async function getCandidateForAdmin(userId: string) {
  const [row] = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        ageConfirmedAt: users.ageConfirmedAt,
        termsAcceptedAt: users.termsAcceptedAt,
      },
      profile: safeProfileColumns,
    })
    .from(users)
    .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(and(eq(users.id, userId), eq(users.role, "candidate")))
    .limit(1);

  if (!row) return null;

  const [{ activeSessions }] = await db
    .select({ activeSessions: count() })
    .from(sessions)
    .where(
      and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())),
    );

  return {
    user: row.user,
    // Sem perfil, o left join devolve profile = null.
    profile: row.profile as SafeCandidateProfile | null,
    activeSessions,
  };
}

// ---------------------------------------------------------------------------
// Usuários (todos os tipos de conta)

export type UserFilters = {
  q?: string;
  role?: "candidate" | "employer" | "admin";
  status?: "active" | "suspended";
  page: number;
};

export async function listUsers(filters: UserFilters) {
  const conditions: SQL[] = [];
  if (filters.q) {
    const pattern = containsPattern(filters.q);
    conditions.push(
      or(ilike(users.name, pattern), ilike(users.email, pattern))!,
    );
  }
  if (filters.role) conditions.push(eq(users.role, filters.role));
  if (filters.status) conditions.push(eq(users.status, filters.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const activeSessions = db
    .select({ userId: sessions.userId, n: count().as("n") })
    .from(sessions)
    .where(gt(sessions.expiresAt, new Date()))
    .groupBy(sessions.userId)
    .as("active_sessions");

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        activeSessions: sql<number>`coalesce(${activeSessions.n}, 0)`.mapWith(
          Number,
        ),
      })
      .from(users)
      .leftJoin(activeSessions, eq(activeSessions.userId, users.id))
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset(pageOffset(filters.page)),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return { rows, total };
}

export async function getUserForAdmin(userId: string) {
  const [user] = await db
    .select({ id: users.id, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}

// ---------------------------------------------------------------------------
// Auditoria

export type AuditFilters = {
  action?: string;
  targetUserId?: string;
  page: number;
};

export async function listAuditLogs(filters: AuditFilters) {
  const actor = alias(users, "actor");
  const target = alias(users, "target");

  const conditions: SQL[] = [];
  if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
  if (filters.targetUserId) {
    conditions.push(eq(auditLogs.targetUserId, filters.targetUserId));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        actorName: actor.name,
        actorEmail: actor.email,
        targetId: auditLogs.targetUserId,
        targetName: target.name,
        targetEmail: target.email,
        targetRole: target.role,
      })
      .from(auditLogs)
      .leftJoin(actor, eq(actor.id, auditLogs.actorId))
      .leftJoin(target, eq(target.id, auditLogs.targetUserId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset(pageOffset(filters.page)),
    db.select({ total: count() }).from(auditLogs).where(where),
  ]);

  return { rows, total };
}
