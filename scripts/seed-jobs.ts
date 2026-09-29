// Insere as 24 vagas de exemplo (scripts/data/sample-jobs.ts) na tabela
// "jobs", já publicadas. Só roda com a tabela vazia, para não duplicar.
//
// Uso:  yarn db:seed-jobs
// Por padrão grava na branch "test"; para produção, prefixe DB_ENV=production.
import "./load-env";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { count } from "drizzle-orm";

import { jobs } from "../src/db/schema";
import { sampleJobs, sampleTemplates } from "./data/sample-jobs";

const DAY_MS = 24 * 60 * 60 * 1000;

// "$22 – $28/hr", "$12/hr + tips", "$15/hr" → campos estruturados.
function parsePay(text: string | undefined) {
  if (!text) return { payMin: null, payMax: null, payNote: null };
  const match = /^\$([\d.,]+)(?:\s*–\s*\$([\d.,]+))?\/(hr|yr)\s*(.*)$/.exec(
    text,
  );
  if (!match) throw new Error(`Salário em formato inesperado: ${text}`);
  const [, min, max, period, note] = match;
  const toNumber = (value: string) => Number(value.replace(/,/g, ""));
  return {
    payMin: toNumber(min),
    payMax: max ? toNumber(max) : null,
    payPeriod: period === "yr" ? ("year" as const) : ("hour" as const),
    payNote: note.trim() || null,
  };
}

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));
  const host = new URL(process.env.DATABASE_URL!).host.split(".")[0];

  const [{ total }] = await db.select({ total: count() }).from(jobs);
  if (total > 0) {
    console.log(`A tabela jobs já tem ${total} vagas em ${host}; nada feito.`);
    return;
  }

  const now = Date.now();
  // Da mais antiga para a mais nova, para os IDs seguirem a ordem cronológica.
  const rows = [...sampleJobs]
    .sort((a, b) => b.postedAgoDays - a.postedAgoDays)
    .map((job) => {
      const [city, state] = job.location.split(",").map((s) => s.trim());
      const template = sampleTemplates[job.categorySlug];
      return {
        title: job.title,
        category: job.categorySlug,
        city,
        state,
        workMode: job.workMode,
        contractType: job.contractType,
        ...parsePay(job.salaryRange),
        description: template.description,
        responsibilities: template.responsibilities,
        requirements: template.requirements,
        benefits: template.benefits,
        schedule: template.schedule,
        status: "published" as const,
        publishedAt: new Date(now - job.postedAgoDays * DAY_MS),
      };
    });

  await db.insert(jobs).values(rows);
  console.log(`${rows.length} vagas de exemplo inseridas em ${host}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
