"use server";

import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import type { AuthFormState } from "@/lib/auth/form-state";
import { hashPassword } from "@/lib/auth/password";
import {
  deleteUserResetTokens,
  findValidResetToken,
} from "@/lib/auth/password-reset";
import { createSession, deleteUserSessions } from "@/lib/auth/session";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

export async function resetPassword(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!password) {
    return { fieldErrors: { password: "passwordRequired" } };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { fieldErrors: { password: "passwordTooShort" } };
  }

  const userId = token ? await findValidResetToken(token) : null;
  if (!userId) {
    return { formError: "invalidResetToken" };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(users.id, userId));

  // O link só pode ser usado uma vez, e qualquer sessão aberta com a senha
  // antiga (ex.: por quem a roubou) é encerrada.
  await deleteUserResetTokens(userId);
  await deleteUserSessions(userId);
  await createSession(userId);

  redirect({ href: "/", locale: await getLocale() });
}
