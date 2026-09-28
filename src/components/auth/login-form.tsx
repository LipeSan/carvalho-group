"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";

import { login } from "@/app/[locale]/entrar/actions";
import { Link } from "@/i18n/navigation";

import {
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
} from "./form-fields";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("Login");
  const tAuth = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state?.formError && (
        <FormAlert>{tAuth(`errors.${state.formError}`)}</FormAlert>
      )}

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
        autoComplete="current-password"
        label={tAuth("fields.passwordLabel")}
        placeholder={tAuth("fields.passwordPlaceholder")}
        error={state?.fieldErrors?.password}
        labelAction={
          <Link
            href="/recuperar-senha"
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
