"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { resetPassword } from "@/app/[locale]/reset-password/actions";
import {
  FormAlert,
  PasswordField,
  SubmitButton,
} from "@/components/forms/form-fields";
import { Link } from "@/i18n/navigation";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("ResetPassword");
  const tAuth = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      {state?.formError && (
        <FormAlert>
          {tAuth(`errors.${state.formError}`)}{" "}
          <Link href="/forgot-password" className="font-medium underline">
            {t("requestNew")}
          </Link>
        </FormAlert>
      )}

      <PasswordField
        name="password"
        autoComplete="new-password"
        label={t("passwordLabel")}
        placeholder={tAuth("fields.newPasswordPlaceholder", {
          min: MIN_PASSWORD_LENGTH,
        })}
        error={
          state?.fieldErrors?.password &&
          tAuth(`errors.${state.fieldErrors.password}`)
        }
      />

      <SubmitButton
        pending={pending}
        label={t("submit")}
        pendingLabel={t("submitting")}
      />
    </form>
  );
}
