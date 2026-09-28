"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";

import { requestPasswordReset } from "@/app/[locale]/forgot-password/actions";
import {
  FormAlert,
  SubmitButton,
  TextField,
} from "@/components/forms/form-fields";

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
  const tAuth = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  if (state?.success) {
    return (
      <FormAlert variant="success">
        <p className="font-medium">{t("successTitle")}</p>
        <p className="mt-1 text-muted-foreground">
          {t("successText", { email: state.values?.email ?? "" })}
        </p>
      </FormAlert>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <TextField
        name="email"
        type="email"
        autoComplete="email"
        label={tAuth("fields.emailLabel")}
        placeholder={tAuth("fields.emailPlaceholder")}
        icon={Mail}
        defaultValue={state?.values?.email}
        error={
          state?.fieldErrors?.email &&
          tAuth(`errors.${state.fieldErrors.email}`)
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
