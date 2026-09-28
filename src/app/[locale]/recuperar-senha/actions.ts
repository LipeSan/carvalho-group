"use server";

import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getPathname } from "@/i18n/navigation";
import type { AuthFormState } from "@/lib/auth/form-state";
import { normalizeEmail } from "@/lib/auth/password";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { EMAIL_PATTERN } from "@/lib/auth/validation";
import { getAppUrl, sendEmail } from "@/lib/email";

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { values: { email }, fieldErrors: { email: "emailRequired" } };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { values: { email }, fieldErrors: { email: "emailInvalid" } };
  }

  const locale = await getLocale();

  // O token e o email são gerados depois da resposta (after), e a resposta é
  // sempre a mesma: assim não dá para descobrir quais emails têm conta nem
  // pela mensagem nem pelo tempo de resposta.
  after(async () => {
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);

    if (!user) return;

    const token = await createPasswordResetToken(user.id);
    const path = getPathname({
      href: { pathname: "/redefinir-senha", query: { token } },
      locale,
    });
    const t = await getTranslations({ locale, namespace: "ResetEmail" });

    await sendEmail({
      to: user.email,
      subject: t("subject"),
      text: t("body", { name: user.name, link: `${getAppUrl()}${path}` }),
    });
  });

  return { values: { email }, success: true };
}
