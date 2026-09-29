import "server-only";

import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { companies, companyMembers, users } from "@/db/schema";
import type { CompanyStatus } from "@/lib/companies/options";
import { containsPattern } from "@/lib/jobs/queries";

import { ADMIN_PAGE_SIZE } from "./queries";

export type AdminCompanyFilters = {
  q?: string;
  status?: CompanyStatus;
  state?: string;
  page: number;
};

// Busca no nome da empresa e no nome/email do dono.
export async function listCompaniesForAdmin(filters: AdminCompanyFilters) {
  const owner = alias(users, "owner");
  const conditions: SQL[] = [];
  if (filters.q) {
    const pattern = containsPattern(filters.q);
    conditions.push(
      or(
        ilike(companies.name, pattern),
        ilike(owner.name, pattern),
        ilike(owner.email, pattern),
      )!,
    );
  }
  if (filters.status) conditions.push(eq(companies.status, filters.status));
  if (filters.state) conditions.push(eq(companies.state, filters.state));
  const where = conditions.length ? and(...conditions) : undefined;

  const base = db
    .select({
      id: companies.id,
      name: companies.name,
      city: companies.city,
      state: companies.state,
      status: companies.status,
      createdAt: companies.createdAt,
      ownerName: owner.name,
      ownerEmail: owner.email,
    })
    .from(companies)
    .leftJoin(
      companyMembers,
      and(
        eq(companyMembers.companyId, companies.id),
        eq(companyMembers.role, "owner"),
      ),
    )
    .leftJoin(owner, eq(owner.id, companyMembers.userId))
    .where(where);

  const [rows, [{ total }]] = await Promise.all([
    // Pendentes primeiro (fila de aprovação), depois as mais recentes.
    base
      .orderBy(
        sql`case when ${companies.status} = 'pending' then 0 else 1 end`,
        desc(companies.createdAt),
      )
      .limit(ADMIN_PAGE_SIZE)
      .offset((filters.page - 1) * ADMIN_PAGE_SIZE),
    db
      .select({ total: count() })
      .from(companies)
      .leftJoin(
        companyMembers,
        and(
          eq(companyMembers.companyId, companies.id),
          eq(companyMembers.role, "owner"),
        ),
      )
      .leftJoin(owner, eq(owner.id, companyMembers.userId))
      .where(where),
  ]);

  return { rows, total };
}

export async function countPendingCompanies(): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(companies)
    .where(eq(companies.status, "pending"));
  return total;
}

export async function getCompanyForAdmin(id: string) {
  const reviewer = alias(users, "reviewer");
  const [company] = await db
    .select({
      company: companies,
      reviewerName: reviewer.name,
    })
    .from(companies)
    .leftJoin(reviewer, eq(reviewer.id, companies.reviewedBy))
    .where(eq(companies.id, id))
    .limit(1);
  if (!company) return null;

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      role: companyMembers.role,
      createdAt: companyMembers.createdAt,
    })
    .from(companyMembers)
    .innerJoin(users, eq(users.id, companyMembers.userId))
    .where(eq(companyMembers.companyId, id))
    .orderBy(companyMembers.createdAt);

  return { ...company.company, reviewerName: company.reviewerName, members };
}
