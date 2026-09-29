import "server-only";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { companies, companyMembers, users } from "@/db/schema";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth/session";
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { isUsState, normalizeUsPhone } from "@/lib/profile/options";

import type {
  CompanyFormErrorCode,
  CompanyFormField,
  CompanyFormValues,
} from "./form-state";
import {
  COMPANY_LIMITS,
  normalizeEin,
  normalizeWebsite,
  type CompanyStatus,
} from "./options";

type ParsedCompanyAccount = {
  owner: { name: string; email: string; password: string };
  company: {
    name: string;
    ein: string | null;
    website: string | null;
    phone: string;
    city: string;
    state: string;
  };
};

// Valida o formulário de empresa + responsável. `requireTerms` só no
// autocadastro: quando o admin cria, não há aceite de termos no ato.
export function parseCompanyAccountForm(
  formData: FormData,
  { requireTerms }: { requireTerms: boolean },
):
  | { ok: true; data: ParsedCompanyAccount; values: CompanyFormValues }
  | {
      ok: false;
      values: CompanyFormValues;
      fieldErrors: Partial<Record<CompanyFormField, CompanyFormErrorCode>>;
    } {
  const text = (name: CompanyFormField) =>
    String(formData.get(name) ?? "").trim();

  const values: CompanyFormValues = {
    name: text("name"),
    email: text("email"),
    companyName: text("companyName"),
    ein: text("ein"),
    website: text("website"),
    phone: text("phone"),
    city: text("city"),
    state: text("state"),
    termsAccepted: formData.get("termsAccepted") === "on",
  };
  const password = String(formData.get("password") ?? "");
  const errors: Partial<Record<CompanyFormField, CompanyFormErrorCode>> = {};
  const L = COMPANY_LIMITS;

  if (!values.name) errors.name = "required";
  if (!values.email) errors.email = "required";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = "emailInvalid";
  if (!password) errors.password = "required";
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "passwordTooShort";
  }
  if (requireTerms && !values.termsAccepted) {
    errors.termsAccepted = "termsNotAccepted";
  }

  const companyName = values.companyName!;
  if (!companyName) errors.companyName = "required";
  else if (companyName.length < L.nameMin) errors.companyName = "tooShort";
  else if (companyName.length > L.nameMax) errors.companyName = "tooLong";

  const ein = values.ein ? normalizeEin(values.ein) : null;
  if (values.ein && !ein) errors.ein = "einInvalid";

  const website = values.website ? normalizeWebsite(values.website) : null;
  if (values.website && (!website || website.length > L.websiteMax)) {
    errors.website = "websiteInvalid";
  }

  const phone = values.phone ? normalizeUsPhone(values.phone) : null;
  if (!values.phone) errors.phone = "required";
  else if (!phone) errors.phone = "phoneInvalid";

  if (!values.city) errors.city = "required";
  else if (values.city.length > L.cityMax) errors.city = "tooLong";
  if (!isUsState(values.state)) errors.state = "stateRequired";

  if (Object.keys(errors).length > 0) {
    return { ok: false, values, fieldErrors: errors };
  }

  return {
    ok: true,
    values,
    data: {
      owner: { name: values.name!, email: values.email!, password },
      company: {
        name: companyName,
        ein,
        website,
        phone: phone!,
        city: values.city!,
        state: values.state!,
      },
    },
  };
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  return Boolean(row);
}

// Código do Postgres para violação de restrição única.
const UNIQUE_VIOLATION = "23505";

// Cria conta do responsável (role employer), empresa e vínculo de dono numa
// única transação: ou tudo é criado, ou nada. Devolve null se o email já
// existe (corrida entre dois cadastros simultâneos).
export async function createCompanyWithOwner(
  data: ParsedCompanyAccount,
  { status, reviewedBy }: { status: CompanyStatus; reviewedBy?: string },
): Promise<{ userId: string; companyId: string } | null> {
  const userId = randomUUID();
  const companyId = randomUUID();
  const now = new Date();

  try {
    await db.batch([
      db.insert(users).values({
        id: userId,
        name: data.owner.name,
        email: normalizeEmail(data.owner.email),
        passwordHash: await hashPassword(data.owner.password),
        role: "employer",
        termsAcceptedAt: now,
      }),
      db.insert(companies).values({
        id: companyId,
        ...data.company,
        status,
        reviewedAt: reviewedBy ? now : null,
        reviewedBy: reviewedBy ?? null,
      }),
      db.insert(companyMembers).values({ userId, companyId, role: "owner" }),
    ]);
  } catch (error) {
    const code =
      (error as { cause?: { code?: string }; code?: string }).cause?.code ??
      (error as { code?: string }).code;
    if (code === UNIQUE_VIOLATION) return null;
    throw error;
  }

  return { userId, companyId };
}

// Empresa da conta de employer logada (painel do employer).
export async function getCompanyForMember(userId: string) {
  const [row] = await db
    .select({
      id: companies.id,
      name: companies.name,
      status: companies.status,
      rejectionReason: companies.rejectionReason,
      city: companies.city,
      state: companies.state,
      createdAt: companies.createdAt,
      role: companyMembers.role,
    })
    .from(companyMembers)
    .innerJoin(companies, eq(companies.id, companyMembers.companyId))
    .where(eq(companyMembers.userId, userId))
    .limit(1);
  return row ?? null;
}

// Para páginas e actions da área da empresa: exige conta de employer ativa
// vinculada a uma empresa. Qualquer outro caso recebe 404.
export async function requireEmployer() {
  const user = await getCurrentUser();
  if (user?.role !== "employer") notFound();
  const company = await getCompanyForMember(user.id);
  if (!company) notFound();
  return { user, company };
}
