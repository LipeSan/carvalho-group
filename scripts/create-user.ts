// Cria um usuário direto no banco. É o único jeito de criar um admin: o
// cadastro do site só cria candidatos.
//
// Uso:  yarn user:create <email> <senha> <nome> [candidate|employer|admin]
// Por padrão grava na branch "test"; para produção, prefixe DB_ENV=production.
import "./load-env";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { userRole, users } from "../src/db/schema";
import { hashPassword, normalizeEmail } from "../src/lib/auth/password";

type Role = (typeof userRole.enumValues)[number];

async function main() {
  const [email, password, name, role = "candidate"] = process.argv.slice(2);
  const roles = userRole.enumValues as readonly string[];

  if (!email || !password || !name || !roles.includes(role)) {
    console.error(
      `Uso: yarn user:create <email> <senha> <nome> [${roles.join("|")}]`,
    );
    process.exit(1);
  }

  const db = drizzle(neon(process.env.DATABASE_URL!));
  const now = new Date();
  const [user] = await db
    .insert(users)
    .values({
      email: normalizeEmail(email),
      name,
      role: role as Role,
      passwordHash: await hashPassword(password),
      ageConfirmedAt: now,
      termsAcceptedAt: now,
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  const host = new URL(process.env.DATABASE_URL!).host.split(".")[0];
  console.log(`Usuário criado: ${user.email} (${user.role}) em ${host}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
