// Recria a massa de teste: APAGA todos os dados, exceto as contas admin, e
// cria 5 empresas aprovadas (cada uma com a conta do dono e 3 vagas
// publicadas), 20 candidatos com perfil completo e candidaturas de 10 deles.
//
// Uso:  SEED_PASSWORD=<senha> yarn db:seed-demo --confirm
// Por padrão grava na branch "test"; para produção, prefixe DB_ENV=production.
//
// Todas as contas criadas usam a senha de SEED_PASSWORD. Os dados são
// fictícios: emails em @example.com (domínio reservado, nenhum email chega a
// alguém) e telefones 555-01xx (faixa reservada para ficção nos EUA).
import "./load-env";

import { del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { and, eq, isNotNull, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../src/db/schema";
import type { ApplicationStatus } from "../src/lib/applications/options";
import { hashPassword, normalizeEmail } from "../src/lib/auth/password";
import type {
  CategorySlug,
  ContractType,
  PayPeriod,
  WorkMode,
} from "../src/lib/jobs/options";
import { sampleTemplates } from "./data/sample-jobs";

const {
  auditLogs,
  candidateProfiles,
  companies,
  companyMembers,
  jobApplications,
  jobs,
  users,
} = schema;

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - days * DAY_MS - hours * 60 * 60 * 1000);

type SeedJob = {
  title: string;
  category: CategorySlug;
  contractType: ContractType;
  workMode?: WorkMode;
  pay: [number, number | null, PayPeriod, string?];
  postedDaysAgo: number;
};

const seedCompanies: {
  name: string;
  city: string;
  state: string;
  phone: string;
  owner: string;
  jobs: [SeedJob, SeedJob, SeedJob];
}[] = [
  {
    name: "Sunshine Cleaning Services LLC",
    city: "Orlando",
    state: "FL",
    phone: "+14075550101",
    owner: "Carla Mendes",
    jobs: [
      {
        title: "Residential House Cleaner",
        category: "cleaningHelper",
        contractType: "fullTime",
        pay: [17, 20, "hour"],
        postedDaysAgo: 2,
      },
      {
        title: "Commercial Cleaner – Night Shift",
        category: "cleaningHelper",
        contractType: "partTime",
        pay: [18, 21, "hour"],
        postedDaysAgo: 6,
      },
      {
        title: "Move-Out Cleaning Crew Member",
        category: "cleaningHelper",
        contractType: "temporary",
        pay: [19, null, "hour", "+ tips"],
        postedDaysAgo: 12,
      },
    ],
  },
  {
    name: "Brasa Grill Steakhouse",
    city: "Newark",
    state: "NJ",
    phone: "+19735550102",
    owner: "Ricardo Alves",
    jobs: [
      {
        title: "Line Cook – Churrascaria",
        category: "cook",
        contractType: "fullTime",
        pay: [20, 24, "hour"],
        postedDaysAgo: 1,
      },
      {
        title: "Bartender – Weekend Nights",
        category: "bartender",
        contractType: "partTime",
        pay: [12, null, "hour", "+ tips"],
        postedDaysAgo: 4,
      },
      {
        title: "Cashier / Host",
        category: "cashier",
        contractType: "partTime",
        pay: [16, 18, "hour"],
        postedDaysAgo: 9,
      },
    ],
  },
  {
    name: "Atlantic Drywall & Plaster Inc.",
    city: "Boston",
    state: "MA",
    phone: "+16175550103",
    owner: "Michael O'Brien",
    jobs: [
      {
        title: "Drywall Finisher",
        category: "plasterer",
        contractType: "fullTime",
        pay: [26, 32, "hour"],
        postedDaysAgo: 3,
      },
      {
        title: "Plasterer – Historic Renovations",
        category: "plasterer",
        contractType: "contract",
        pay: [30, 36, "hour"],
        postedDaysAgo: 8,
      },
      {
        title: "Construction Laborer",
        category: "construction",
        contractType: "fullTime",
        pay: [21, 24, "hour"],
        postedDaysAgo: 14,
      },
    ],
  },
  {
    name: "Lone Star Painting Co.",
    city: "Austin",
    state: "TX",
    phone: "+15125550104",
    owner: "Jessica Ramirez",
    jobs: [
      {
        title: "Interior Painter",
        category: "painter",
        contractType: "fullTime",
        pay: [20, 25, "hour"],
        postedDaysAgo: 2,
      },
      {
        title: "Exterior Painter – Residential",
        category: "painter",
        contractType: "fullTime",
        pay: [21, 26, "hour"],
        postedDaysAgo: 7,
      },
      {
        title: "Painter Helper",
        category: "painter",
        contractType: "partTime",
        pay: [16, 18, "hour"],
        postedDaysAgo: 11,
      },
    ],
  },
  {
    name: "Harbor View Hotel Group",
    city: "Miami",
    state: "FL",
    phone: "+13055550105",
    owner: "Daniel Costa",
    jobs: [
      {
        title: "Front Desk Attendant",
        category: "attendant",
        contractType: "fullTime",
        pay: [18, 21, "hour"],
        postedDaysAgo: 1,
      },
      {
        title: "Pool Bar Bartender",
        category: "bartender",
        contractType: "fullTime",
        pay: [14, null, "hour", "+ tips"],
        postedDaysAgo: 5,
      },
      {
        title: "Housekeeping Attendant",
        category: "attendant",
        contractType: "temporary",
        pay: [17, 19, "hour"],
        postedDaysAgo: 10,
      },
    ],
  },
];

type Education = (typeof schema.candidateProfiles.$inferInsert)["education"];

const seedCandidates: {
  name: string;
  city: string;
  state: string;
  zip: string;
  role: string;
  skills: string[];
  education: Education;
  authorized: boolean;
  sponsorship: boolean;
  signedUpDaysAgo: number;
}[] = [
  {
    name: "Ana Souza",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    role: "cleaningHelper",
    skills: ["cleaning", "portugueseSpeaking", "englishSpeaking"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 28,
  },
  {
    name: "Lucas Oliveira",
    city: "Newark",
    state: "NJ",
    zip: "07102",
    role: "cook",
    skills: ["cooking", "portugueseSpeaking"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 26,
  },
  {
    name: "María González",
    city: "Miami",
    state: "FL",
    zip: "33130",
    role: "housekeeper",
    skills: ["cleaning", "spanishSpeaking", "customerService"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 25,
  },
  {
    name: "José Hernández",
    city: "Austin",
    state: "TX",
    zip: "78701",
    role: "painter",
    skills: ["painting", "powerTools", "spanishSpeaking"],
    education: "lessThanHighSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 23,
  },
  {
    name: "Emily Johnson",
    city: "Boston",
    state: "MA",
    zip: "02108",
    role: "cashier",
    skills: ["customerService", "englishSpeaking"],
    education: "someCollege",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 22,
  },
  {
    name: "Rafael Lima",
    city: "Framingham",
    state: "MA",
    zip: "01702",
    role: "drywallInstaller",
    skills: ["drywall", "plastering", "portugueseSpeaking"],
    education: "highSchool",
    authorized: true,
    sponsorship: true,
    signedUpDaysAgo: 20,
  },
  {
    name: "Carlos Ramírez",
    city: "Houston",
    state: "TX",
    zip: "77002",
    role: "constructionLaborer",
    skills: ["concrete", "heavyLifting", "osha10", "spanishSpeaking"],
    education: "lessThanHighSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 19,
  },
  {
    name: "Juliana Ferreira",
    city: "Orlando",
    state: "FL",
    zip: "32803",
    role: "server",
    skills: ["customerService", "portugueseSpeaking", "englishSpeaking"],
    education: "someCollege",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 17,
  },
  {
    name: "Michael Brown",
    city: "Newark",
    state: "NJ",
    zip: "07104",
    role: "bartender",
    skills: ["customerService", "englishSpeaking"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 16,
  },
  {
    name: "Gabriela Santos",
    city: "Danbury",
    state: "CT",
    zip: "06810",
    role: "cleaningHelper",
    skills: ["cleaning", "portugueseSpeaking"],
    education: "highSchool",
    authorized: false,
    sponsorship: true,
    signedUpDaysAgo: 15,
  },
  {
    name: "Luis Martínez",
    city: "Miami",
    state: "FL",
    zip: "33125",
    role: "attendant",
    skills: ["customerService", "spanishSpeaking", "englishSpeaking"],
    education: "associate",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 13,
  },
  {
    name: "Thiago Pereira",
    city: "Boston",
    state: "MA",
    zip: "02125",
    role: "plasterer",
    skills: ["plastering", "drywall", "tile"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 12,
  },
  {
    name: "Sarah Williams",
    city: "Austin",
    state: "TX",
    zip: "78704",
    role: "cashier",
    skills: ["customerService"],
    education: "bachelor",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 10,
  },
  {
    name: "Diego Castillo",
    city: "Tampa",
    state: "FL",
    zip: "33602",
    role: "roofer",
    skills: ["roofing", "heavyLifting", "spanishSpeaking"],
    education: "lessThanHighSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 9,
  },
  {
    name: "Fernanda Rocha",
    city: "Newark",
    state: "NJ",
    zip: "07105",
    role: "cook",
    skills: ["cooking", "portugueseSpeaking", "spanishSpeaking"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 8,
  },
  {
    name: "Kevin Nguyen",
    city: "Houston",
    state: "TX",
    zip: "77036",
    role: "warehouseAssociate",
    skills: ["forklift", "heavyLifting", "englishSpeaking"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 6,
  },
  {
    name: "Patrícia Almeida",
    city: "Charlotte",
    state: "NC",
    zip: "28202",
    role: "caregiver",
    skills: ["customerService", "portugueseSpeaking"],
    education: "associate",
    authorized: true,
    sponsorship: true,
    signedUpDaysAgo: 5,
  },
  {
    name: "Andrés López",
    city: "Austin",
    state: "TX",
    zip: "78745",
    role: "painter",
    skills: ["painting", "spanishSpeaking", "driversLicense"],
    education: "highSchool",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 4,
  },
  {
    name: "Bruno Carvalho",
    city: "Orlando",
    state: "FL",
    zip: "32805",
    role: "handyman",
    skills: ["carpentry", "painting", "powerTools"],
    education: "someCollege",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 2,
  },
  {
    name: "Ashley Davis",
    city: "Miami",
    state: "FL",
    zip: "33139",
    role: "bartender",
    skills: ["customerService", "englishSpeaking", "spanishSpeaking"],
    education: "someCollege",
    authorized: true,
    sponsorship: false,
    signedUpDaysAgo: 1,
  },
];

// Candidatos (índice acima) que se candidatam, com as vagas escolhidas por
// [empresa, vaga] e a etapa de cada candidatura.
const seedApplications: [
  number,
  [company: number, job: number, status: ApplicationStatus][],
][] = [
  [
    0,
    [
      [0, 0, "reviewing"],
      [0, 1, "new"],
    ],
  ],
  [1, [[1, 0, "hired"]]],
  [
    2,
    [
      [4, 2, "new"],
      [0, 0, "rejected"],
    ],
  ],
  [
    3,
    [
      [3, 0, "reviewing"],
      [3, 1, "new"],
    ],
  ],
  [4, [[1, 2, "new"]]],
  [
    5,
    [
      [2, 0, "reviewing"],
      [2, 1, "new"],
    ],
  ],
  [6, [[2, 2, "new"]]],
  [
    8,
    [
      [1, 1, "reviewing"],
      [4, 1, "new"],
    ],
  ],
  [
    10,
    [
      [4, 0, "hired"],
      [4, 2, "new"],
    ],
  ],
  [
    11,
    [
      [2, 1, "new"],
      [2, 0, "rejected"],
      [2, 2, "new"],
    ],
  ],
];

function emailFor(name: string, domain = "example.com") {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  return normalizeEmail(`${slug}@${domain}`);
}

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "Este script APAGA todos os dados, exceto as contas admin.\n" +
        "Uso: SEED_PASSWORD=<senha> yarn db:seed-demo --confirm",
    );
    process.exit(1);
  }
  const password = process.env.SEED_PASSWORD ?? "";
  if (password.length < 8) {
    console.error("Defina SEED_PASSWORD (mínimo 8 caracteres).");
    process.exit(1);
  }

  const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  const host = new URL(process.env.DATABASE_URL!).host.split(".")[0];

  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);
  if (!admin) {
    console.error(`Nenhuma conta admin em ${host}; nada foi apagado.`);
    process.exit(1);
  }

  // CVs de quem vai ser apagado: saem do Blob depois da limpeza do banco.
  const resumes = await db
    .select({ pathname: candidateProfiles.resumePathname })
    .from(candidateProfiles)
    .innerJoin(users, eq(users.id, candidateProfiles.userId))
    .where(
      and(ne(users.role, "admin"), isNotNull(candidateProfiles.resumePathname)),
    );

  // Tudo numa transação: ou apaga tudo, ou nada. Apagar os usuários leva
  // junto sessões, perfis, vínculos com empresas e candidaturas (cascade).
  await db.batch([
    db.delete(jobApplications),
    db.delete(jobs),
    db.delete(companyMembers),
    db.delete(companies),
    db.delete(auditLogs),
    db.delete(users).where(ne(users.role, "admin")),
  ]);
  const resumePaths = resumes.flatMap((r) => (r.pathname ? [r.pathname] : []));
  if (resumePaths.length) await del(resumePaths);
  console.log(
    `Limpeza em ${host}: dados apagados, contas admin mantidas, ${resumePaths.length} CV(s) removido(s) do Blob.`,
  );

  // Mesmo hash para todas as contas de teste (mesma senha).
  const passwordHash = await hashPassword(password);
  const jobIds: number[][] = [];

  for (const [index, seed] of seedCompanies.entries()) {
    const createdAt = daysAgo(30 - index * 3);
    const [owner] = await db
      .insert(users)
      .values({
        name: seed.owner,
        email: emailFor(seed.owner),
        passwordHash,
        role: "employer",
        ageConfirmedAt: createdAt,
        termsAcceptedAt: createdAt,
        createdAt,
      })
      .returning({ id: users.id });
    const [company] = await db
      .insert(companies)
      .values({
        name: seed.name,
        phone: seed.phone,
        city: seed.city,
        state: seed.state,
        status: "approved",
        reviewedAt: daysAgo(29 - index * 3),
        reviewedBy: admin.id,
        createdAt,
      })
      .returning({ id: companies.id });
    await db
      .insert(companyMembers)
      .values({ userId: owner.id, companyId: company.id, role: "owner" });

    const created = await db
      .insert(jobs)
      .values(
        seed.jobs.map((job) => {
          const template = sampleTemplates[job.category];
          const [payMin, payMax, payPeriod, payNote] = job.pay;
          return {
            title: job.title,
            category: job.category,
            city: seed.city,
            state: seed.state,
            workMode: job.workMode ?? "onsite",
            contractType: job.contractType,
            payMin,
            payMax,
            payPeriod,
            payNote: payNote ?? null,
            description: template.description,
            responsibilities: template.responsibilities,
            requirements: template.requirements,
            benefits: template.benefits,
            schedule: template.schedule,
            status: "published" as const,
            publishedAt: daysAgo(job.postedDaysAgo),
            createdAt: daysAgo(job.postedDaysAgo, 2),
            createdBy: owner.id,
            companyId: company.id,
          };
        }),
      )
      .returning({ id: jobs.id });
    jobIds.push(created.map((job) => job.id));
  }

  const candidateIds: string[] = [];
  for (const [index, seed] of seedCandidates.entries()) {
    const createdAt = daysAgo(seed.signedUpDaysAgo, index % 5);
    const [user] = await db
      .insert(users)
      .values({
        name: seed.name,
        email: emailFor(seed.name),
        passwordHash,
        role: "candidate",
        ageConfirmedAt: createdAt,
        termsAcceptedAt: createdAt,
        createdAt,
      })
      .returning({ id: users.id });
    await db.insert(candidateProfiles).values({
      userId: user.id,
      // DDD de cidades variadas + 555-01XX (faixa fictícia).
      phone: `+1${["407", "973", "617", "512", "305"][index % 5]}55501${String(index).padStart(2, "0")}`,
      city: seed.city,
      state: seed.state,
      zip: seed.zip,
      desiredRole: seed.role,
      skills: seed.skills,
      education: seed.education,
      workAuthorized: seed.authorized,
      needsSponsorship: seed.sponsorship,
      createdAt,
    });
    candidateIds.push(user.id);
  }

  let applications = 0;
  for (const [candidate, picks] of seedApplications) {
    await db.insert(jobApplications).values(
      picks.map(([company, job, status], order) => {
        const posted = seedCompanies[company].jobs[job].postedDaysAgo;
        // Depois da publicação da vaga e do cadastro do candidato.
        const days = Math.min(
          posted,
          seedCandidates[candidate].signedUpDaysAgo,
        );
        return {
          jobId: jobIds[company][job],
          candidateId: candidateIds[candidate],
          status,
          createdAt: daysAgo(Math.max(0, days - 1), order * 3 + 1),
        };
      }),
    );
    applications += picks.length;
  }

  console.log(
    `Criados em ${host}: ${seedCompanies.length} empresas (com conta do dono), ` +
      `${jobIds.flat().length} vagas, ${candidateIds.length} candidatos e ` +
      `${applications} candidaturas de ${seedApplications.length} candidatos.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
