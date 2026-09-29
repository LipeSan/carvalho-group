"use client";

import { useTranslations } from "next-intl";

import { CityStateFields } from "@/components/forms/city-state-fields";
import { JOB_LIMITS } from "@/lib/jobs/form-state";

// Local da vaga: cidade (com sugestões do Google) + estado.
export function JobLocationFields({
  initialCity,
  initialState,
  errors,
}: {
  initialCity?: string;
  initialState?: string;
  errors: { city?: string; state?: string };
}) {
  const t = useTranslations("JobForm");

  return (
    <CityStateFields
      initialCity={initialCity}
      initialState={initialState}
      cityMaxLength={JOB_LIMITS.cityMax}
      labels={{
        city: t("fields.city"),
        cityPlaceholder: t("form.cityPlaceholder"),
        state: t("fields.state"),
        statePlaceholder: t("form.select"),
      }}
      errors={errors}
    />
  );
}
