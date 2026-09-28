import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurada. Veja .env.example para configurar o Neon.",
    );
  }
  return drizzle(neon(url), { schema });
}

type Database = ReturnType<typeof createDb>;

let instance: Database | undefined;

// A conexão só é criada na primeira consulta. Assim, páginas que não chegam a
// tocar no banco (ex.: visitante sem cookie de sessão) funcionam mesmo sem
// DATABASE_URL, como durante o build.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    instance ??= createDb();
    return Reflect.get(instance, prop, instance);
  },
});
