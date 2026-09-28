"use server";

import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import type { AuthFormState } from "@/lib/auth/form-state";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { EMAIL_PATTERN, safeNextPath } from "@/lib/auth/validation";

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: NonNullable<AuthFormState>["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "emailRequired";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "emailInvalid";
  }

  if (!password) {
    fieldErrors.password = "passwordRequired";
  }

  if (fieldErrors.email || fieldErrors.password) {
    return { values: { email }, fieldErrors };
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  // Quando o email não existe, ainda verificamos contra um hash fictício para
  // que o tempo de resposta não revele quais emails estão cadastrados.
  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? (await getDummyHash()),
  );

  if (!user || !passwordMatches) {
    return { values: { email }, formError: "invalidCredentials" };
  }

  await createSession(user.id);

  redirect({
    href: safeNextPath(formData.get("next")),
    locale: await getLocale(),
  });
}

let dummyHash: Promise<string> | undefined;

function getDummyHash() {
  dummyHash ??= hashPassword("dummy-password");
  return dummyHash;
}
