"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";

import { login } from "@/app/[locale]/sign-in/actions";
import {
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/forms/form-fields";
import { Link } from "@/i18n/navigation";
import type { AuthErrorCode } from "@/lib/auth/form-state";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("Login");
  const tAuth = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(login, undefined);

  const errorMessage = (code?: AuthErrorCode) =>
    code && tAuth(`errors.${code}`);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state?.formError && (
        <FormAlert>{errorMessage(state.formError)}</FormAlert>
      )}

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
        autoComplete="current-password"
        label={tAuth("fields.passwordLabel")}
        placeholder={tAuth("fields.passwordPlaceholder")}
        error={errorMessage(state?.fieldErrors?.password)}
        labelAction={
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
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
