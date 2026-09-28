"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail, User } from "lucide-react";

import { signUp } from "@/app/[locale]/cadastro/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

import {
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
} from "./form-fields";

export function SignUpForm() {
  const t = useTranslations("SignUp");
  const tAuth = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(signUp, undefined);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state?.formError && (
        <FormAlert>{tAuth(`errors.${state.formError}`)}</FormAlert>
      )}

      <TextField
        name="name"
        autoComplete="name"
        label={tAuth("fields.nameLabel")}
        placeholder={tAuth("fields.namePlaceholder")}
        icon={User}
        defaultValue={state?.values?.name}
        error={state?.fieldErrors?.name}
      />

      <TextField
        name="email"
        type="email"
        autoComplete="email"
        label={tAuth("fields.emailLabel")}
        placeholder={tAuth("fields.emailPlaceholder")}
        icon={Mail}
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
      />

      <PasswordField
        name="password"
        autoComplete="new-password"
        label={tAuth("fields.passwordLabel")}
        placeholder={tAuth("fields.newPasswordPlaceholder", {
          min: MIN_PASSWORD_LENGTH,
        })}
        error={state?.fieldErrors?.password}
      />

      <SubmitButton
        pending={pending}
        label={t("submit")}
        pendingLabel={t("submitting")}
      />

      <p className="text-center text-xs text-muted-foreground">{t("terms")}</p>
    </form>
  );
}
