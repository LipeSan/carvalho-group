"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  SelectField,
  SubmitButton,
  TextField,
  TextareaField,
} from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  JOB_LIMITS,
  type JobFormErrorCode,
  type JobFormField,
  type JobFormState,
  type JobFormValues,
} from "@/lib/jobs/form-state";
import {
  categorySlugs,
  contractTypes,
  jobStatuses,
  payPeriods,
  workModes,
  type JobStatus,
} from "@/lib/jobs/options";

import { JobLocationFields } from "./job-location-fields";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-lg font-medium">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

// Formulário de vaga, usado pelo admin e pelas empresas. Quem usa decide a
// action que salva, para onde "Cancelar" volta e quais status são permitidos
// (ex.: empresa ainda em análise só pode salvar rascunho).
export function JobForm({
  jobId,
  initialValues,
  action,
  cancelHref,
  allowedStatuses = jobStatuses,
  statusHint,
}: {
  // Sem jobId, cria uma vaga nova.
  jobId?: number;
  initialValues: JobFormValues;
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  cancelHref: string;
  allowedStatuses?: readonly JobStatus[];
  // Aviso abaixo do status (ex.: por que só rascunho está disponível).
  statusHint?: string;
}) {
  const t = useTranslations("JobForm");
  const tCategories = useTranslations("Categories.list");
  const tJobs = useTranslations("Jobs");
  const [state, formAction, pending] = useActionState(action, undefined);

  const values = state?.values ?? initialValues;
  const errors = state?.fieldErrors ?? {};
  const errorFor = (field: JobFormField) => {
    const code: JobFormErrorCode | undefined = errors[field];
    return code && t(`errors.${code}`, JOB_LIMITS);
  };
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {jobId && <input type="hidden" name="id" value={jobId} />}

      {hasErrors && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {t("form.fixErrors")}
        </p>
      )}

      <Section title={t("form.sections.basics")}>
        <TextField
          name="title"
          label={t("fields.title")}
          placeholder="Line Cook – Brazilian Steakhouse"
          maxLength={JOB_LIMITS.titleMax}
          defaultValue={values.title}
          error={errorFor("title")}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            name="category"
            label={t("fields.category")}
            placeholder={t("form.select")}
            options={categorySlugs.map((slug) => ({
              value: slug,
              label: tCategories(slug),
            }))}
            defaultValue={values.category}
            error={errorFor("category")}
          />
          <SelectField
            name="contractType"
            label={t("fields.contractType")}
            placeholder={t("form.select")}
            options={contractTypes.map((type) => ({
              value: type,
              label: tJobs(`contractType.${type}`),
            }))}
            defaultValue={values.contractType}
            error={errorFor("contractType")}
          />
          <SelectField
            name="workMode"
            label={t("fields.workMode")}
            placeholder={t("form.select")}
            options={workModes.map((mode) => ({
              value: mode,
              label: tJobs(`workMode.${mode}`),
            }))}
            defaultValue={values.workMode}
            error={errorFor("workMode")}
          />
        </div>
        <JobLocationFields
          // Remonta com os valores devolvidos quando a action aponta erro.
          key={`${values.city ?? ""}|${values.state ?? ""}`}
          initialCity={values.city}
          initialState={values.state}
          errors={{ city: errorFor("city"), state: errorFor("state") }}
        />
      </Section>

      <Section title={t("form.sections.pay")} description={t("form.payHint")}>
        <div className="grid gap-5 sm:grid-cols-4">
          <TextField
            name="payMin"
            label={t("fields.payMin")}
            optionalLabel={t("form.optional")}
            inputMode="decimal"
            placeholder="18"
            defaultValue={values.payMin}
            error={errorFor("payMin")}
          />
          <TextField
            name="payMax"
            label={t("fields.payMax")}
            optionalLabel={t("form.optional")}
            inputMode="decimal"
            placeholder="22"
            defaultValue={values.payMax}
            error={errorFor("payMax")}
          />
          <SelectField
            name="payPeriod"
            label={t("fields.payPeriod")}
            placeholder={t("form.select")}
            options={payPeriods.map((period) => ({
              value: period,
              label: t(`payPeriods.${period}`),
            }))}
            defaultValue={values.payPeriod}
            error={errorFor("payPeriod")}
          />
          <TextField
            name="payNote"
            label={t("fields.payNote")}
            optionalLabel={t("form.optional")}
            placeholder="+ tips"
            maxLength={JOB_LIMITS.payNoteMax}
            defaultValue={values.payNote}
            error={errorFor("payNote")}
          />
        </div>
      </Section>

      <Section
        title={t("form.sections.details")}
        description={t("form.contentHint")}
      >
        <TextareaField
          name="description"
          label={t("fields.description")}
          rows={5}
          maxLength={JOB_LIMITS.descriptionMax}
          defaultValue={values.description}
          error={errorFor("description")}
        />
        {(["responsibilities", "requirements", "benefits"] as const).map(
          (field) => (
            <TextareaField
              key={field}
              name={field}
              label={t(`fields.${field}`)}
              optionalLabel={t("form.optional")}
              hint={t("form.onePerLine")}
              rows={4}
              defaultValue={values[field]}
              error={errorFor(field)}
            />
          ),
        )}
        <TextField
          name="schedule"
          label={t("fields.schedule")}
          optionalLabel={t("form.optional")}
          placeholder="Monday – Friday, 7:00 AM – 3:30 PM"
          maxLength={JOB_LIMITS.scheduleMax}
          defaultValue={values.schedule}
          error={errorFor("schedule")}
        />
      </Section>

      <Section title={t("form.sections.publishing")}>
        <div className="sm:max-w-xs">
          <SelectField
            name="status"
            label={t("fields.status")}
            placeholder={t("form.select")}
            options={allowedStatuses.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            }))}
            defaultValue={values.status}
            error={errorFor("status")}
          />
        </div>
        {statusHint && (
          <p className="text-sm text-muted-foreground">{statusHint}</p>
        )}
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          size="lg"
          className="h-11"
          render={<Link href={cancelHref} />}
        >
          {t("form.cancel")}
        </Button>
        <SubmitButton
          pending={pending}
          label={jobId ? t("form.save") : t("form.create")}
          pendingLabel={t("form.saving")}
          className="sm:min-w-40"
        />
      </div>
    </form>
  );
}
