import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { redirect } from "@/i18n/navigation";

import { SESSION_COOKIE } from "./constants";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Deduplicado por request com cache(): vários Server Components podem chamar
// sem gerar consultas repetidas ao banco.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, hashToken(token)))
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) return null;

  return { id: row.id, name: row.name, email: row.email, role: row.role };
});

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE);
}

// Encerra todas as sessões do usuário (ex.: depois de redefinir a senha).
export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// Para páginas protegidas: devolve o usuário logado ou redireciona ao login.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/entrar", locale: await getLocale() });
  }
  return user;
}

// Para páginas de visitante (login, cadastro...): quem já está logado vai
// direto para a home.
export async function redirectIfSignedIn(): Promise<void> {
  if (await getCurrentUser()) {
    redirect({ href: "/", locale: await getLocale() });
  }
}
