// Cria um usuário direto no banco enquanto não existe tela de cadastro.
// Uso: yarn user:create <email> <senha> <nome> [candidate|employer]
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { users } from "../src/db/schema";
import { hashPassword, normalizeEmail } from "../src/lib/auth/password";

config({ path: ".env.local" });

async function main() {
  const [email, password, name, role = "candidate"] = process.argv.slice(2);

  if (
    !email ||
    !password ||
    !name ||
    (role !== "candidate" && role !== "employer")
  ) {
    console.error(
      "Uso: yarn user:create <email> <senha> <nome> [candidate|employer]",
    );
    process.exit(1);
  }

  const db = drizzle(neon(process.env.DATABASE_URL!));
  const [user] = await db
    .insert(users)
    .values({
      email: normalizeEmail(email),
      name,
      role,
      passwordHash: await hashPassword(password),
    })
    .returning({ id: users.id, email: users.email });

  console.log(`Usuário criado: ${user.email} (${user.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
