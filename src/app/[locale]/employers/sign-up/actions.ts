"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createSession } from "@/lib/auth/session";
import {
  createCompanyWithOwner,
  isEmailTaken,
  parseCompanyAccountForm,
} from "@/lib/companies/accounts";
import type { CompanyFormState } from "@/lib/companies/form-state";

// Autocadastro de empresa: cria conta + empresa "em análise" e já entra.
export async function employerSignUp(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const parsed = parseCompanyAccountForm(formData, { requireTerms: true });
  if (!parsed.ok) {
    return { values: parsed.values, fieldErrors: parsed.fieldErrors };
  }

  if (await isEmailTaken(parsed.data.owner.email)) {
    return { values: parsed.values, fieldErrors: { email: "emailTaken" } };
  }

  const created = await createCompanyWithOwner(parsed.data, {
    status: "pending",
  });
  if (!created) {
    return { values: parsed.values, fieldErrors: { email: "emailTaken" } };
  }

  await createSession(created.userId);
  redirect({ href: "/employers/dashboard", locale: await getLocale() });
}
