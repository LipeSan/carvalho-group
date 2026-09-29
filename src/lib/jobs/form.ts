import type { Job, jobs } from "@/db/schema";
import { isOneOf, isUsState } from "@/lib/profile/options";

import {
  JOB_LIMITS,
  splitLines,
  type JobFormErrorCode,
  type JobFormField,
  type JobFormValues,
} from "./form-state";
import {
  categorySlugs,
  contractTypes,
  jobStatuses,
  payPeriods,
  workModes,
  type CategorySlug,
  type JobStatus,
} from "./options";

// Validação do formulário de vaga, usada pelo admin e pelas empresas.

// Converte a vaga do banco nos valores de texto do formulário de edição.
export function jobToFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    category: job.category,
    contractType: job.contractType,
    workMode: job.workMode,
    city: job.city,
    state: job.state,
    payMin: job.payMin?.toString() ?? "",
    payMax: job.payMax?.toString() ?? "",
    payPeriod: job.payPeriod,
    payNote: job.payNote ?? "",
    description: job.description,
    responsibilities: job.responsibilities.join("\n"),
    requirements: job.requirements.join("\n"),
    benefits: job.benefits.join("\n"),
    schedule: job.schedule ?? "",
    status: job.status,
  };
}

type ParsedJob = Omit<
  typeof jobs.$inferInsert,
  "id" | "status" | "publishedAt" | "createdBy" | "createdAt" | "updatedAt"
> & { status: JobStatus };

// Valida o formulário e devolve os dados prontos para o banco ou os erros.
export function parseJobForm(formData: FormData):
  | { ok: true; data: ParsedJob; values: JobFormValues }
  | {
      ok: false;
      values: JobFormValues;
      fieldErrors: Partial<Record<JobFormField, JobFormErrorCode>>;
    } {
  const text = (name: JobFormField) => String(formData.get(name) ?? "").trim();

  const values: JobFormValues = {};
  for (const field of [
    "title",
    "category",
    "contractType",
    "workMode",
    "city",
    "state",
    "payMin",
    "payMax",
    "payPeriod",
    "payNote",
    "description",
    "responsibilities",
    "requirements",
    "benefits",
    "schedule",
    "status",
  ] as const) {
    values[field] = text(field);
  }

  const errors: Partial<Record<JobFormField, JobFormErrorCode>> = {};
  const L = JOB_LIMITS;

  const title = values.title!;
  if (!title) errors.title = "required";
  else if (title.length < L.titleMin) errors.title = "tooShort";
  else if (title.length > L.titleMax) errors.title = "tooLong";

  if (!isOneOf(categorySlugs, values.category))
    errors.category = "invalidOption";
  if (!isOneOf(contractTypes, values.contractType)) {
    errors.contractType = "invalidOption";
  }
  if (!isOneOf(workModes, values.workMode)) errors.workMode = "invalidOption";
  if (!isOneOf(payPeriods, values.payPeriod))
    errors.payPeriod = "invalidOption";
  if (!isOneOf(jobStatuses, values.status)) errors.status = "invalidOption";

  const city = values.city!;
  if (!city) errors.city = "required";
  else if (city.length > L.cityMax) errors.city = "tooLong";
  if (!isUsState(values.state)) errors.state = "invalidOption";

  // Aceita "22", "22.50" e "45,000" (vírgula de milhar).
  const amount = (field: "payMin" | "payMax") => {
    const raw = values[field]!.replace(/[$,\s]/g, "");
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0 || n > L.payMax) {
      errors[field] = "invalidAmount";
      return null;
    }
    return Math.round(n * 100) / 100;
  };
  const payMin = amount("payMin");
  const payMax = amount("payMax");
  if (payMin != null && payMax != null && payMin > payMax) {
    errors.payMax = "minAboveMax";
  }
  if (values.payNote!.length > L.payNoteMax) errors.payNote = "tooLong";

  const description = values.description!;
  if (!description) errors.description = "required";
  else if (description.length < L.descriptionMin)
    errors.description = "tooShort";
  else if (description.length > L.descriptionMax)
    errors.description = "tooLong";

  const list = (field: "responsibilities" | "requirements" | "benefits") => {
    const items = splitLines(values[field]!);
    if (items.length > L.listItems) errors[field] = "tooManyItems";
    else if (items.some((item) => item.length > L.listItemMax)) {
      errors[field] = "itemTooLong";
    }
    return items;
  };
  const responsibilities = list("responsibilities");
  const requirements = list("requirements");
  const benefits = list("benefits");

  if (values.schedule!.length > L.scheduleMax) errors.schedule = "tooLong";

  if (Object.keys(errors).length > 0) {
    return { ok: false, values, fieldErrors: errors };
  }

  return {
    ok: true,
    values,
    data: {
      title,
      category: values.category as CategorySlug,
      contractType: values.contractType as (typeof contractTypes)[number],
      workMode: values.workMode as (typeof workModes)[number],
      city,
      state: values.state!,
      payMin,
      payMax,
      payPeriod: values.payPeriod as (typeof payPeriods)[number],
      payNote: values.payNote || null,
      description,
      responsibilities,
      requirements,
      benefits,
      schedule: values.schedule || null,
      status: values.status as JobStatus,
    },
  };
}
