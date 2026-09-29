"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Globe, Hash, Mail, Phone, User } from "lucide-react";

import { CityStateFields } from "@/components/forms/city-state-fields";
import {
  CheckboxField,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/forms/form-fields";
import { Link } from "@/i18n/navigation";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import type {
  CompanyFormErrorCode,
  CompanyFormField,
  CompanyFormState,
} from "@/lib/companies/form-state";
import { COMPANY_LIMITS } from "@/lib/companies/options";

const legalLinkClass =
  "font-medium text-primary underline-offset-4 hover:underline";

// Formulário de empresa + conta do responsável. mode="signup": autocadastro
// público (com aceite de termos). mode="admin": criação pelo admin (a senha
// é provisória e passada à empresa por outro canal).
export function CompanyAccountForm({
  mode,
  action,
  footer,
}: {
  mode: "signup" | "admin";
  action: (
    state: CompanyFormState,
    formData: FormData,
  ) => Promise<CompanyFormState>;
  footer?: React.ReactNode;
}) {
  const t = useTranslations("EmployerSignUp");
  const [state, formAction, pending] = useActionState(action, undefined);

  const values = state?.values ?? {};
  const errors = state?.fieldErrors ?? {};
  const errorFor = (field: CompanyFormField) => {
    const code: CompanyFormErrorCode | undefined = errors[field];
    return code && t(`errors.${code}`, { min: MIN_PASSWORD_LENGTH });
  };

  const section = (title: string, children: React.ReactNode) => (
    <fieldset className="flex flex-col gap-5">
      <legend className="mb-1 text-xs font-semibold tracking-[0.15em] text-primary uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      {section(
        mode === "signup" ? t("sections.you") : t("sections.owner"),
        <>
          <TextField
            name="name"
            autoComplete="name"
            label={t("fields.name")}
            placeholder={t("fields.namePlaceholder")}
            icon={User}
            defaultValue={values.name}
            error={errorFor("name")}
          />
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            label={t("fields.email")}
            placeholder={t("fields.emailPlaceholder")}
            icon={Mail}
            defaultValue={values.email}
            error={errorFor("email")}
          />
          <PasswordField
            name="password"
            autoComplete="new-password"
            label={
              mode === "signup"
                ? t("fields.password")
                : t("fields.temporaryPassword")
            }
            placeholder={t("fields.passwordPlaceholder", {
              min: MIN_PASSWORD_LENGTH,
            })}
            error={errorFor("password")}
          />
        </>,
      )}

      {section(
        t("sections.company"),
        <>
          <TextField
            name="companyName"
            autoComplete="organization"
            label={t("fields.companyName")}
            placeholder="Acme Construction LLC"
            icon={Building2}
            maxLength={COMPANY_LIMITS.nameMax}
            defaultValue={values.companyName}
            error={errorFor("companyName")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              label={t("fields.phone")}
              placeholder="(407) 555-1234"
              icon={Phone}
              defaultValue={values.phone}
              error={errorFor("phone")}
            />
            <TextField
              name="ein"
              inputMode="numeric"
              label={t("fields.ein")}
              optionalLabel={t("optional")}
              placeholder="12-3456789"
              icon={Hash}
              maxLength={10}
              defaultValue={values.ein}
              error={errorFor("ein")}
            />
          </div>
          <TextField
            name="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            label={t("fields.website")}
            optionalLabel={t("optional")}
            placeholder="acmeconstruction.com"
            icon={Globe}
            maxLength={COMPANY_LIMITS.websiteMax}
            defaultValue={values.website}
            error={errorFor("website")}
          />
          <CityStateFields
            key={`${values.city ?? ""}|${values.state ?? ""}`}
            initialCity={values.city}
            initialState={values.state}
            cityMaxLength={COMPANY_LIMITS.cityMax}
            labels={{
              city: t("fields.city"),
              cityPlaceholder: t("fields.cityPlaceholder"),
              state: t("fields.state"),
              statePlaceholder: t("fields.select"),
            }}
            errors={{ city: errorFor("city"), state: errorFor("state") }}
          />
        </>,
      )}

      {mode === "signup" && (
        <CheckboxField
          name="termsAccepted"
          defaultChecked={values.termsAccepted}
          error={errorFor("termsAccepted")}
        >
          {t.rich("termsAcceptance", {
            terms: (chunks) => (
              <Link href="/terms" target="_blank" className={legalLinkClass}>
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" target="_blank" className={legalLinkClass}>
                {chunks}
              </Link>
            ),
          })}
        </CheckboxField>
      )}

      <div className="flex flex-col gap-3">
        <SubmitButton
          pending={pending}
          label={mode === "signup" ? t("submit") : t("adminSubmit")}
          pendingLabel={t("submitting")}
        />
        {footer}
      </div>
    </form>
  );
}
