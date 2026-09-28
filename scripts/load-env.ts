import { config } from "dotenv";

// Mesma prioridade do `next dev`: o .env.development.local (branch "test" do
// Neon) vence o .env.local (branch principal, gerado pelo `vercel env pull`).
// Com DB_ENV=production, só o .env.local é lido, para atuar em produção.
config({
  path:
    process.env.DB_ENV === "production"
      ? ".env.local"
      : [".env.development.local", ".env.local"],
  quiet: true,
});
