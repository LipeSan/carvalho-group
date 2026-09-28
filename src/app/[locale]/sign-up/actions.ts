"use server";

import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import type { AuthFormState } from "@/lib/auth/form-state";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

// Código do Postgres para violação de restrição única.
const UNIQUE_VIOLATION = "23505";

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const ageConfirmed = formData.get("ageConfirmed") === "on";
  const termsAccepted = formData.get("termsAccepted") === "on";

  const values = { name, email, ageConfirmed, termsAccepted };
  const fieldErrors: NonNullable<AuthFormState>["fieldErrors"] = {};

  if (!name) fieldErrors.name = "nameRequired";
  if (!ageConfirmed) fieldErrors.ageConfirmed = "ageNotConfirmed";
  if (!termsAccepted) fieldErrors.termsAccepted = "termsNotAccepted";

  if (!email) {
    fieldErrors.email = "emailRequired";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "emailInvalid";
  }

  if (!password) {
    fieldErrors.password = "passwordRequired";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = "passwordTooShort";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { values, fieldErrors };
  }

  const normalizedEmail = normalizeEmail(email);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return { values, fieldErrors: { email: "emailTaken" } };
  }

  let userId: string;
  try {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        ageConfirmedAt: now,
        termsAcceptedAt: now,
      })
      .returning({ id: users.id });
    userId = user.id;
  } catch (error) {
    // Dois cadastros simultâneos com o mesmo email passam pela checagem acima.
    if (
      (error as { cause?: { code?: string } }).cause?.code === UNIQUE_VIOLATION
    ) {
      return { values, fieldErrors: { email: "emailTaken" } };
    }
    throw error;
  }

  await createSession(userId);

  // Conta criada: segue para o onboarding do perfil (pode ser pulado).
  redirect({ href: "/profile", locale: await getLocale() });
}
