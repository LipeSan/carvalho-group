"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import { requireEmployer } from "@/lib/companies/accounts";
import { getJobForCompany } from "@/lib/companies/jobs";
import { parseJobForm } from "@/lib/jobs/form";
import type { JobFormState } from "@/lib/jobs/form-state";
import { jobStatuses, type JobStatus } from "@/lib/jobs/options";
import { isOneOf } from "@/lib/profile/options";

// Toda action confere de novo a empresa e a posse da vaga no servidor: o
// formulário não é confiável (ex.: um id de vaga de outra empresa).

export async function employerSaveJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const { user, company } = await requireEmployer();
  const locale = await getLocale();

  const parsed = parseJobForm(formData);
  if (!parsed.ok) {
    return { values: parsed.values, fieldErrors: parsed.fieldErrors };
  }
  const { data } = parsed;

  // Só empresa aprovada publica. Em análise ou recusada: rascunho ou
  // encerrada.
  if (data.status === "published" && company.status !== "approved") {
    return { values: parsed.values, fieldErrors: { status: "notAllowed" } };
  }

  const rawId = String(formData.get("id") ?? "");
  if (rawId) {
    const existing = /^\d+$/.test(rawId)
      ? await getJobForCompany(company.id, Number(rawId))
      : null;
    if (!existing) notFound();

    await db
      .update(jobs)
      .set({
        ...data,
        publishedAt:
          existing.publishedAt ??
          (data.status === "published" ? new Date() : null),
      })
      .where(eq(jobs.id, existing.id));
  } else {
    await db.insert(jobs).values({
      ...data,
      companyId: company.id,
      createdBy: user.id,
      publishedAt: data.status === "published" ? new Date() : null,
    });
  }

  redirect({ href: "/employers/jobs", locale });
}

export async function employerSetJobStatus(
  jobId: number,
  status: JobStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { company } = await requireEmployer();
  if (!isOneOf(jobStatuses, status)) return { ok: false, error: "notFound" };
  if (status === "published" && company.status !== "approved") {
    return { ok: false, error: "notAllowed" };
  }

  const job = await getJobForCompany(company.id, Number(jobId));
  if (!job) return { ok: false, error: "notFound" };
  if (job.status === status) return { ok: true };

  await db
    .update(jobs)
    .set({
      status,
      publishedAt:
        job.publishedAt ?? (status === "published" ? new Date() : null),
    })
    .where(eq(jobs.id, job.id));

  refresh();
  return { ok: true };
}
