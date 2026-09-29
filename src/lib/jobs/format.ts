import type { Job } from "@/db/schema";

import type { JobDetails, PayPeriod, PublicJob } from "./options";

const DAY_MS = 24 * 60 * 60 * 1000;

const PERIOD_SUFFIX: Record<PayPeriod, string> = { hour: "/hr", year: "/yr" };

// Formato americano, igual em todos os idiomas: é o valor que a empresa
// anuncia ("$22 – $28/hr", "$45,000/yr + bonus").
function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPay(
  job: Pick<Job, "payMin" | "payMax" | "payPeriod" | "payNote">,
): string | undefined {
  const { payMin, payMax, payPeriod, payNote } = job;
  if (payMin == null && payMax == null) return payNote || undefined;

  const suffix = PERIOD_SUFFIX[payPeriod];
  const range =
    payMin != null && payMax != null && payMin !== payMax
      ? `${money(payMin)} – ${money(payMax)}${suffix}`
      : `${money((payMin ?? payMax)!)}${suffix}`;
  return payNote ? `${range} ${payNote}` : range;
}

export function daysSince(date: Date | null, now = Date.now()): number {
  if (!date) return 0;
  return Math.max(0, Math.floor((now - date.getTime()) / DAY_MS));
}

type PublicJobRow = Pick<
  Job,
  | "id"
  | "title"
  | "category"
  | "city"
  | "state"
  | "workMode"
  | "contractType"
  | "payMin"
  | "payMax"
  | "payPeriod"
  | "payNote"
  | "publishedAt"
>;

// Converte a linha do banco no formato dos cards (PublicJob).
export function toPublicJob(row: PublicJobRow): PublicJob {
  return {
    id: String(row.id),
    title: row.title,
    categorySlug: row.category,
    location: `${row.city}, ${row.state}`,
    workMode: row.workMode,
    contractType: row.contractType,
    salaryRange: formatPay(row),
    postedAgoDays: daysSince(row.publishedAt),
  };
}

export function toJobDetails(row: Job): JobDetails {
  return {
    ...toPublicJob(row),
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    benefits: row.benefits,
    schedule: row.schedule,
  };
}
