"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, UserRound } from "lucide-react";

import { sendContactMessage } from "@/app/[locale]/contact/actions";
import {
  FormAlert,
  SelectField,
  SubmitButton,
  TextField,
  TextareaField,
} from "@/components/forms/form-fields";
import { Link } from "@/i18n/navigation";
import type { ContactField } from "@/lib/contact/form-state";
import { CONTACT_LIMITS, type ContactSubject } from "@/lib/contact/options";

export function ContactForm({
  subjects,
  defaultSubject,
}: {
  subjects: { value: ContactSubject; label: string }[];
  // Assunto já escolhido quando a pessoa vem da página de um serviço.
  defaultSubject?: ContactSubject;
}) {
  const t = useTranslations("Contact");
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    undefined,
  );

  if (state?.success) {
    return (
      <FormAlert variant="success">
        <p className="font-medium">{t("form.successTitle")}</p>
        <p className="mt-1 text-muted-foreground">{t("form.successText")}</p>
      </FormAlert>
    );
  }

  const error = (field: ContactField) => {
    const code = state?.fieldErrors?.[field];
    return code
      ? t(`errors.${code}`, {
          min: CONTACT_LIMITS.messageMin,
          max: CONTACT_LIMITS.messageMax,
        })
      : undefined;
  };

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state?.formError && (
        <FormAlert>{t(`errors.${state.formError}`)}</FormAlert>
      )}

      <TextField
        name="name"
        autoComplete="name"
        label={t("form.name")}
        icon={UserRound}
        maxLength={CONTACT_LIMITS.name}
        defaultValue={state?.values?.name}
        error={error("name")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="email"
          type="email"
          autoComplete="email"
          label={t("form.email")}
          icon={Mail}
          maxLength={CONTACT_LIMITS.email}
          defaultValue={state?.values?.email}
          error={error("email")}
        />
        <TextField
          name="phone"
          type="tel"
          autoComplete="tel"
          label={t("form.phone")}
          optionalLabel={t("form.optional")}
          icon={Phone}
          maxLength={CONTACT_LIMITS.phone}
          defaultValue={state?.values?.phone}
          error={error("phone")}
        />
      </div>

      <SelectField
        name="subject"
        label={t("form.subject")}
        placeholder={t("form.subjectPlaceholder")}
        options={subjects}
        defaultValue={state?.values?.subject ?? defaultSubject}
      />

      <TextareaField
        name="message"
        label={t("form.message")}
        placeholder={t("form.messagePlaceholder")}
        rows={6}
        className="min-h-36"
        maxLength={CONTACT_LIMITS.messageMax}
        defaultValue={state?.values?.message}
        error={error("message")}
      />

      {/* Armadilha para robôs: invisível para pessoas e leitores de tela. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        {t.rich("form.privacy", {
          link: (chunks) => (
            <Link
              href="/privacy"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <SubmitButton
        pending={pending}
        label={t("form.submit")}
        pendingLabel={t("form.submitting")}
      />
    </form>
  );
}
