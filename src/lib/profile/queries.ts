import "server-only";

import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db";
import { candidateProfiles, type CandidateProfile } from "@/db/schema";

// Perfil sem os documentos criptografados. É o que as páginas usam: SSN e
// passaporte completos não saem do banco a não ser por um fluxo específico.
export type SafeCandidateProfile = Omit<
  CandidateProfile,
  "ssnEncrypted" | "passportNumberEncrypted"
>;

const encryptedColumns = new Set(["ssnEncrypted", "passportNumberEncrypted"]);

const safeColumns = Object.fromEntries(
  Object.entries(getTableColumns(candidateProfiles)).filter(
    ([name]) => !encryptedColumns.has(name),
  ),
) as Omit<
  ReturnType<typeof getTableColumns<typeof candidateProfiles>>,
  "ssnEncrypted" | "passportNumberEncrypted"
>;

export async function getCandidateProfile(
  userId: string,
): Promise<SafeCandidateProfile | null> {
  const [profile] = await db
    .select(safeColumns)
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

type ProfileUpdate = Partial<
  Omit<CandidateProfile, "userId" | "createdAt" | "updatedAt">
>;

// Cria o perfil na primeira vez e depois só atualiza os campos do passo salvo.
export async function saveCandidateProfile(
  userId: string,
  data: ProfileUpdate,
): Promise<void> {
  await db
    .insert(candidateProfiles)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: candidateProfiles.userId,
      set: { ...data, updatedAt: new Date() },
    });
}
