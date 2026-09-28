"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail, User } from "lucide-react";

import { signUp } from "@/app/[locale]/sign-up/actions";
import {
  CheckboxField,
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/forms/form-fields";
import { Link } from "@/i18n/navigation";
import type { AuthErrorCode } from "@/lib/auth/form-state";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

const legalLinkClass =
  "font-medium text-primary underline-offset-4 hover:underline";

export function SignUpForm() {
  const t = useTranslations("SignUp");
  const tAuth = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(signUp, undefined);

  const errorMessage = (code?: AuthErrorCode) =>
    code && tAuth(`errors.${code}`);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state?.formError && (
        <FormAlert>{errorMessage(state.formError)}</FormAlert>
      )}

      <TextField
        name="name"
        autoComplete="name"
        label={tAuth("fields.nameLabel")}
        placeholder={tAuth("fields.namePlaceholder")}
        icon={User}
        defaultValue={state?.values?.name}
        error={errorMessage(state?.fieldErrors?.name)}
      />

      <TextField
        name="email"
        type="email"
        autoComplete="email"
        label={tAuth("fields.emailLabel")}
        placeholder={tAuth("fields.emailPlaceholder")}
        icon={Mail}
        defaultValue={state?.values?.email}
        error={errorMessage(state?.fieldErrors?.email)}
      />

      <PasswordField
        name="password"
        autoComplete="new-password"
        label={tAuth("fields.passwordLabel")}
        placeholder={tAuth("fields.newPasswordPlaceholder", {
          min: MIN_PASSWORD_LENGTH,
        })}
        error={errorMessage(state?.fieldErrors?.password)}
      />

      <div className="flex flex-col gap-3">
        <CheckboxField
          name="ageConfirmed"
          defaultChecked={state?.values?.ageConfirmed}
          error={errorMessage(state?.fieldErrors?.ageConfirmed)}
        >
          {t("ageConfirmation")}
        </CheckboxField>

        <CheckboxField
          name="termsAccepted"
          defaultChecked={state?.values?.termsAccepted}
          error={errorMessage(state?.fieldErrors?.termsAccepted)}
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
      </div>

      <SubmitButton
        pending={pending}
        label={t("submit")}
        pendingLabel={t("submitting")}
      />
    </form>
  );
}
