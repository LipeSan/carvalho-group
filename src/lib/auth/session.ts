import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { redirect } from "@/i18n/navigation";

import { HOME_BY_ROLE, SESSION_COOKIE } from "./constants";
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
      status: users.status,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, hashToken(token)))
    .limit(1);

  if (!row || row.expiresAt.getTime() <= Date.now()) return null;
  // Conta suspensa perde o acesso na hora, mesmo com sessão ainda válida.
  if (row.status !== "active") return null;

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
    return redirect({ href: "/sign-in", locale: await getLocale() });
  }
  return user;
}

// Para a área administrativa: quem não é admin (inclusive visitante) recebe
// 404, sem revelar que a área existe. Chame em TODA página e action do admin:
// o layout sozinho não basta, porque não roda de novo a cada navegação.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") notFound();
  return user;
}

// Para páginas de visitante (login, cadastro...): quem já está logado vai
// direto para a página inicial do seu tipo de conta.
export async function redirectIfSignedIn(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    redirect({ href: HOME_BY_ROLE[user.role], locale: await getLocale() });
  }
}
