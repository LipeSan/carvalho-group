import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";

import { hashToken } from "./session";

const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;

// Gera um novo token e invalida os anteriores do usuário, para que só o link
// do email mais recente funcione.
export async function createPasswordResetToken(
  userId: string,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));
  await db.insert(passwordResetTokens).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
  });

  return token;
}

// Devolve o id do usuário dono de um token válido (existente e não expirado).
export async function findValidResetToken(
  token: string,
): Promise<string | null> {
  const [row] = await db
    .select({ userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.id, hashToken(token)),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return row?.userId ?? null;
}

export async function deleteUserResetTokens(userId: string): Promise<void> {
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));
}
