"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { candidateProfiles, companies, jobs, users } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import { logAudit } from "@/lib/admin/audit";
import type { JobFormState } from "@/lib/jobs/form-state";
import { getJobForAdmin } from "@/lib/admin/jobs";
import { parseJobForm } from "@/lib/jobs/form";
import { getUserForAdmin } from "@/lib/admin/queries";
import { jobStatuses, type JobStatus } from "@/lib/jobs/options";
import { isOneOf } from "@/lib/profile/options";
import { deleteUserSessions, requireAdmin } from "@/lib/auth/session";
import {
  createCompanyWithOwner,
  isEmailTaken,
  parseCompanyAccountForm,
} from "@/lib/companies/accounts";
import type { CompanyFormState } from "@/lib/companies/form-state";
import { COMPANY_LIMITS } from "@/lib/companies/options";
import { decryptPii } from "@/lib/crypto/pii";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

// Toda action repete a verificação de admin: actions podem ser chamadas
// diretamente, sem passar pela página.

export async function revealDocument(
  userId: string,
  document: "ssn" | "passportNumber",
): Promise<{ value: string } | { error: "notFound" }> {
  const admin = await requireAdmin();

  const [row] = await db
    .select({
      ssn: candidateProfiles.ssnEncrypted,
      passportNumber: candidateProfiles.passportNumberEncrypted,
    })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);

  const encrypted = row?.[document];
  if (!encrypted) return { error: "notFound" };

  // Registra antes de devolver: se o log falhar, o documento não é revelado.
  await logAudit({
    actorId: admin.id,
    action: "document.reveal",
    targetUserId: userId,
    metadata: { document },
  });

  return { value: decryptPii(encrypted) };
}

async function changeStatus(
  userId: string,
  status: "active" | "suspended",
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { ok: false, error: "cannotChangeSelf" };

  const target = await getUserForAdmin(userId);
  if (!target) return { ok: false, error: "notFound" };
  if (target.status === status) return { ok: true };

  await db.update(users).set({ status }).where(eq(users.id, userId));
  // Suspensão tira o acesso na hora, encerrando as sessões abertas.
  if (status === "suspended") await deleteUserSessions(userId);

  await logAudit({
    actorId: admin.id,
    action: status === "suspended" ? "user.suspend" : "user.reactivate",
    targetUserId: userId,
  });

  refresh();
  return { ok: true };
}

export async function suspendUser(userId: string) {
  return changeStatus(userId, "suspended");
}

export async function reactivateUser(userId: string) {
  return changeStatus(userId, "active");
}

export async function revokeUserSessions(
  userId: string,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { ok: false, error: "cannotChangeSelf" };

  const target = await getUserForAdmin(userId);
  if (!target) return { ok: false, error: "notFound" };

  await deleteUserSessions(userId);
  await logAudit({
    actorId: admin.id,
    action: "user.revokeSessions",
    targetUserId: userId,
  });

  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Vagas

export async function saveJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const admin = await requireAdmin();
  const locale = await getLocale();

  const parsed = parseJobForm(formData);
  if (!parsed.ok) {
    return { values: parsed.values, fieldErrors: parsed.fieldErrors };
  }
  const { data } = parsed;

  const rawId = String(formData.get("id") ?? "");
  if (rawId) {
    const existing = /^\d+$/.test(rawId)
      ? await getJobForAdmin(Number(rawId))
      : null;
    if (!existing) notFound();

    await db
      .update(jobs)
      .set({
        ...data,
        // A data de publicação é a da primeira vez em que foi publicada.
        publishedAt:
          existing.publishedAt ??
          (data.status === "published" ? new Date() : null),
      })
      .where(eq(jobs.id, existing.id));

    await logAudit({
      actorId: admin.id,
      action: "job.update",
      metadata: { jobId: String(existing.id), title: data.title },
    });
    if (existing.status !== data.status) {
      await logAudit({
        actorId: admin.id,
        action: "job.statusChange",
        metadata: {
          jobId: String(existing.id),
          title: data.title,
          status: data.status,
        },
      });
    }
  } else {
    const [created] = await db
      .insert(jobs)
      .values({
        ...data,
        publishedAt: data.status === "published" ? new Date() : null,
        createdBy: admin.id,
      })
      .returning({ id: jobs.id });

    await logAudit({
      actorId: admin.id,
      action: "job.create",
      metadata: {
        jobId: String(created.id),
        title: data.title,
        status: data.status,
      },
    });
  }

  redirect({ href: "/admin/jobs", locale });
}

export async function setJobStatus(
  jobId: number,
  status: JobStatus,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!isOneOf(jobStatuses, status)) return { ok: false, error: "notFound" };

  const job = await getJobForAdmin(jobId);
  if (!job) return { ok: false, error: "notFound" };
  if (job.status === status) return { ok: true };

  await db
    .update(jobs)
    .set({
      status,
      publishedAt:
        job.publishedAt ?? (status === "published" ? new Date() : null),
    })
    .where(eq(jobs.id, jobId));

  await logAudit({
    actorId: admin.id,
    action: "job.statusChange",
    metadata: { jobId: String(jobId), title: job.title, status },
  });

  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Empresas

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function reviewCompany(
  companyId: string,
  status: "approved" | "rejected",
  reason: string | null,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!UUID_PATTERN.test(companyId)) return { ok: false, error: "notFound" };

  const [company] = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  if (!company) return { ok: false, error: "notFound" };

  await db
    .update(companies)
    .set({
      status,
      rejectionReason: status === "rejected" ? reason : null,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
    })
    .where(eq(companies.id, companyId));

  await logAudit({
    actorId: admin.id,
    action: status === "approved" ? "company.approve" : "company.reject",
    metadata: {
      companyId,
      name: company.name,
      ...(reason ? { reason } : {}),
    },
  });

  refresh();
  return { ok: true };
}

export async function approveCompany(companyId: string) {
  return reviewCompany(companyId, "approved", null);
}

export async function rejectCompany(companyId: string, reason: string) {
  const trimmed = String(reason ?? "").trim();
  if (!trimmed) return { ok: false as const, error: "reasonRequired" };
  if (trimmed.length > COMPANY_LIMITS.rejectionReasonMax) {
    return { ok: false as const, error: "reasonTooLong" };
  }
  return reviewCompany(companyId, "rejected", trimmed);
}

// Criação pelo admin: empresa já aprovada + conta do responsável com senha
// provisória (passada à empresa por outro canal).
export async function adminCreateCompany(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const admin = await requireAdmin();

  const parsed = parseCompanyAccountForm(formData, { requireTerms: false });
  if (!parsed.ok) {
    return { values: parsed.values, fieldErrors: parsed.fieldErrors };
  }
  if (await isEmailTaken(parsed.data.owner.email)) {
    return { values: parsed.values, fieldErrors: { email: "emailTaken" } };
  }

  const created = await createCompanyWithOwner(parsed.data, {
    status: "approved",
    reviewedBy: admin.id,
  });
  if (!created) {
    return { values: parsed.values, fieldErrors: { email: "emailTaken" } };
  }

  await logAudit({
    actorId: admin.id,
    action: "company.create",
    targetUserId: created.userId,
    metadata: { companyId: created.companyId, name: parsed.data.company.name },
  });

  redirect({
    href: `/admin/companies/${created.companyId}`,
    locale: await getLocale(),
  });
}
