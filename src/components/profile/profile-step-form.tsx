"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { BookUser, Cake, IdCard, Phone, ShieldCheck } from "lucide-react";

import { saveProfileStep } from "@/app/[locale]/profile/actions";
import {
  SelectField,
  SubmitButton,
  TextField,
  YesNoField,
} from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type {
  ProfileErrorCode,
  ProfileFormValues,
} from "@/lib/profile/form-state";
import {
  desiredRoles,
  educationLevels,
  maskPassportNumber,
  maskSsn,
} from "@/lib/profile/options";
import type { ProfileStep } from "@/lib/profile/steps";

import { AddressFields } from "./address-fields";
import { SensitiveField } from "./sensitive-field";
import { SkillsField } from "./skills-field";

export function ProfileStepForm({
  step,
  initialValues,
  savedDocuments,
  dateOfBirthBounds,
  skipHref,
  isLastStep,
}: {
  step: ProfileStep;
  initialValues: ProfileFormValues;
  // Só os 4 últimos caracteres dos documentos salvos, para exibição.
  savedDocuments: { ssnLast4?: string; passportNumberLast4?: string };
  // Calculados no servidor para o HTML inicial e o do navegador coincidirem.
  dateOfBirthBounds: { min: string; max: string };
  skipHref: string;
  isLastStep: boolean;
}) {
  const t = useTranslations("Profile");
  const [state, formAction, pending] = useActionState(
    saveProfileStep,
    undefined,
  );

  // Após um erro, mostra o que a pessoa acabou de enviar; senão, o que já
  // está salvo no banco.
  const values = state?.values ?? initialValues;
  const errors = state?.fieldErrors ?? {};
  const errorMessage = (code?: ProfileErrorCode) => code && t(`errors.${code}`);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="step" value={step} />

      {step === "contact" && (
        <>
          <TextField
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            label={t("fields.phone")}
            placeholder="(407) 555-1234"
            icon={Phone}
            defaultValue={values.phone}
            error={errorMessage(errors.phone)}
          />
          <TextField
            name="dateOfBirth"
            type="date"
            autoComplete="bday"
            label={t("fields.dateOfBirth")}
            optionalLabel={t("optional")}
            icon={Cake}
            min={dateOfBirthBounds.min}
            max={dateOfBirthBounds.max}
            defaultValue={values.dateOfBirth}
            error={errorMessage(errors.dateOfBirth)}
          />
          <AddressFields
            // Remonta com os valores enviados quando a action devolve erro.
            key={[values.street, values.city, values.state, values.zip].join(
              "|",
            )}
            initialValues={values}
            errors={{
              street: errorMessage(errors.street),
              city: errorMessage(errors.city),
              state: errorMessage(errors.state),
              zip: errorMessage(errors.zip),
            }}
          />
        </>
      )}

      {step === "professional" && (
        <>
          <SelectField
            name="desiredRole"
            label={t("fields.desiredRole")}
            placeholder={t("fields.selectPlaceholder")}
            options={desiredRoles.map((role) => ({
              value: role,
              label: t(`options.roles.${role}`),
            }))}
            defaultValue={values.desiredRole}
            error={errorMessage(errors.desiredRole)}
          />
          <SkillsField
            key={values.skills?.join("|")}
            defaultValue={values.skills}
            error={errorMessage(errors.skills)}
          />
          <SelectField
            name="education"
            label={t("fields.education")}
            placeholder={t("fields.selectPlaceholder")}
            options={educationLevels.map((level) => ({
              value: level,
              label: t(`options.education.${level}`),
            }))}
            defaultValue={values.education}
            error={errorMessage(errors.education)}
          />
        </>
      )}

      {step === "eligibility" && (
        <>
          <YesNoField
            name="workAuthorized"
            label={t("fields.workAuthorized")}
            yesLabel={t("yes")}
            noLabel={t("no")}
            defaultValue={values.workAuthorized}
            error={errorMessage(errors.workAuthorized)}
          />
          <YesNoField
            name="needsSponsorship"
            label={t("fields.needsSponsorship")}
            yesLabel={t("yes")}
            noLabel={t("no")}
            defaultValue={values.needsSponsorship}
            error={errorMessage(errors.needsSponsorship)}
          />
          <div className="mt-2 flex flex-col gap-5 border-t border-border pt-6">
            <div className="flex items-start gap-2.5 rounded-xl bg-muted px-3.5 py-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>{t("documents.notice")}</p>
            </div>
            <SensitiveField
              name="ssn"
              label={t("fields.ssn")}
              placeholder="123-45-6789"
              icon={IdCard}
              inputMode="numeric"
              maxLength={11}
              savedMasked={
                savedDocuments.ssnLast4 && maskSsn(savedDocuments.ssnLast4)
              }
              error={errorMessage(errors.ssn)}
            />
            <SensitiveField
              name="passportNumber"
              label={t("fields.passportNumber")}
              placeholder="A12345678"
              icon={BookUser}
              maxLength={20}
              savedMasked={
                savedDocuments.passportNumberLast4 &&
                maskPassportNumber(savedDocuments.passportNumberLast4)
              }
              error={errorMessage(errors.passportNumber)}
            />
          </div>
        </>
      )}

      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          size="lg"
          className="h-11"
          render={<Link href={skipHref} />}
        >
          {t("skip")}
        </Button>
        <SubmitButton
          pending={pending}
          label={isLastStep ? t("finish") : t("continue")}
          pendingLabel={t("saving")}
          className="sm:min-w-40"
        />
      </div>
    </form>
  );
}
