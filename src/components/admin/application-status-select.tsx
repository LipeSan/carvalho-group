"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { setApplicationStatus } from "@/app/[locale]/admin/actions";
import { FormSelect } from "@/components/forms/form-select";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/lib/applications/options";

// Troca a etapa da candidatura direto na lista. Todas as etapas podem ser
// desfeitas, então não há confirmação.
export function ApplicationStatusSelect({
  applicationId,
  status,
  label,
}: {
  applicationId: string;
  status: ApplicationStatus;
  // Nome acessível, ex.: "Etapa da candidatura de Maria".
  label: string;
}) {
  const t = useTranslations("Admin.applications");
  const [value, setValue] = useState<string>(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function change(next: string) {
    if (!next || next === value) return;
    const previous = value;
    setValue(next);
    setError(false);
    startTransition(async () => {
      const result = await setApplicationStatus(
        applicationId,
        next as ApplicationStatus,
      );
      if (!result.ok) {
        setValue(previous);
        setError(true);
      }
    });
  }

  return (
    <div className="flex w-full max-w-52 min-w-0 flex-col gap-1">
      <FormSelect
        name="status"
        size="md"
        value={value}
        onValueChange={change}
        placeholder={t("filters.status")}
        aria-label={label}
        options={applicationStatuses.map((option) => ({
          value: option,
          label: t(`statuses.${option}`),
        }))}
        className={pending ? "opacity-60" : undefined}
      />
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {t("statusError")}
        </span>
      )}
    </div>
  );
}
