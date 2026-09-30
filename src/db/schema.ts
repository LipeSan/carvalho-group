import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  categorySlugs,
  contractTypes,
  jobStatuses,
  payPeriods,
  workModes,
} from "../lib/jobs/options";
import { companyMemberRoles, companyStatuses } from "../lib/companies/options";
import { applicationStatuses } from "../lib/applications/options";

// "admin" só é criado pelo script user:create, nunca pelo cadastro do site.
export const userRole = pgEnum("user_role", ["candidate", "employer", "admin"]);

// Conta suspensa não consegue entrar e perde as sessões abertas.
export const userStatus = pgEnum("user_status", ["active", "suspended"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // Sempre salvo em minúsculas (ver normalizeEmail) para o índice único
  // valer independentemente de como o usuário digitou.
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("candidate"),
  status: userStatus("status").notNull().default("active"),
  // Registro de quando a pessoa confirmou ter 18+ e aceitou os termos no
  // cadastro. A data de nascimento, opcional, fica em candidateProfiles.
  ageConfirmedAt: timestamp("age_confirmed_at", { withTimezone: true }),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  // SHA-256 do token que vai no cookie. O token em si nunca é salvo, então
  // um vazamento do banco não permite sequestrar sessões.
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  // SHA-256 do token enviado por email, pelo mesmo motivo de sessions.id.
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Perfil do candidato, preenchido no onboarding depois do cadastro. Todos os
// campos são opcionais: cada passo pode ser pulado e completado depois.
//
// De propósito NÃO guardamos sexo (Title VII). A data de nascimento é
// guardada, mas NUNCA deve ser mostrada às empresas: usar a idade na seleção
// é discriminação pela lei americana (ADEA, que protege quem tem 40+).
//
// SSN e passaporte são guardados só criptografados (ver src/lib/crypto/pii.ts),
// junto com os 4 últimos caracteres para exibição. Nunca devolva o valor
// completo ao navegador nem mostre esses campos para empresas.
export const candidateProfiles = pgTable("candidate_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // Contato. Telefone no formato E.164 (+1XXXXXXXXXX).
  phone: text("phone"),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),

  // Profissional. desiredRole e education guardam slugs das listas em
  // src/lib/profile/options.ts; skills mistura slugs sugeridos e texto livre.
  desiredRole: text("desired_role"),
  skills: text("skills").array(),
  education: text("education"),

  // Elegibilidade.
  workAuthorized: boolean("work_authorized"),
  needsSponsorship: boolean("needs_sponsorship"),
  ssnEncrypted: text("ssn_encrypted"),
  ssnLast4: text("ssn_last4"),
  passportNumberEncrypted: text("passport_number_encrypted"),
  passportNumberLast4: text("passport_number_last4"),

  // Currículo opcional, guardado no Vercel Blob privado (ver
  // src/lib/resumes/options.ts). Aqui só ficam o caminho e os dados de
  // exibição; o arquivo só sai pela rota que confere o acesso.
  resumePathname: text("resume_pathname"),
  resumeFileName: text("resume_file_name"),
  resumeSize: integer("resume_size"),
  resumeUploadedAt: timestamp("resume_uploaded_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;

// Registro das ações feitas na área administrativa (quem, o quê, em quem,
// quando). Nunca guarde aqui o valor de documentos revelados.
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // "set null" preserva o histórico mesmo se a conta for apagada.
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetUserId: uuid("target_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata").$type<Record<string, string>>(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_target_user_id_idx").on(table.targetUserId),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;

export const jobCategory = pgEnum("job_category", categorySlugs);
export const contractType = pgEnum("contract_type", contractTypes);
export const workMode = pgEnum("work_mode", workModes);
export const payPeriod = pgEnum("pay_period", payPeriods);
export const jobStatus = pgEnum("job_status", jobStatuses);

// Vagas. Criadas pelas empresas (área /employers/jobs) ou pelo admin.
export const jobs = pgTable(
  "jobs",
  {
    // Número sequencial para URLs curtas (/jobs/123).
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: text("title").notNull(),
    category: jobCategory("category").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    workMode: workMode("work_mode").notNull().default("onsite"),
    contractType: contractType("contract_type").notNull(),
    // Salário estruturado (em dólares) para exibir e, no futuro, filtrar.
    // Vários estados dos EUA exigem a faixa salarial no anúncio.
    payMin: numeric("pay_min", { precision: 10, scale: 2, mode: "number" }),
    payMax: numeric("pay_max", { precision: 10, scale: 2, mode: "number" }),
    payPeriod: payPeriod("pay_period").notNull().default("hour"),
    // Complemento livre, ex.: "+ tips".
    payNote: text("pay_note"),
    description: text("description").notNull(),
    responsibilities: text("responsibilities").array().notNull().default([]),
    requirements: text("requirements").array().notNull().default([]),
    benefits: text("benefits").array().notNull().default([]),
    schedule: text("schedule"),
    status: jobStatus("status").notNull().default("draft"),
    // Preenchido na primeira publicação; é a data "Publicada há X dias".
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    // Empresa dona da vaga. Nulo nas vagas criadas pelo admin em nome da
    // plataforma. Nunca exposta no site (empresa confidencial).
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("jobs_status_published_at_idx").on(table.status, table.publishedAt),
    index("jobs_category_idx").on(table.category),
    index("jobs_company_id_idx").on(table.companyId),
  ],
);

export type Job = typeof jobs.$inferSelect;

export const companyStatus = pgEnum("company_status", companyStatuses);
export const companyMemberRole = pgEnum(
  "company_member_role",
  companyMemberRoles,
);

// Empresas (employers). Entram pelo autocadastro (/employers/sign-up) como
// "pending" e o admin aprova ou recusa; o admin também pode criá-las.
export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Opcional: muitos pequenos negócios (sole proprietors) não têm EIN.
    ein: text("ein"),
    website: text("website"),
    // E.164 (+1XXXXXXXXXX), como o telefone do candidato.
    phone: text("phone").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    status: companyStatus("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("companies_status_idx").on(table.status)],
);

// Quem acessa cada empresa. Uma conta de employer pertence a uma empresa só.
export const companyMembers = pgTable("company_members", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  role: companyMemberRole("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Company = typeof companies.$inferSelect;

export const applicationStatus = pgEnum(
  "application_status",
  applicationStatuses,
);

// Candidaturas: um candidato se candidata uma vez a cada vaga. Os dados do
// candidato não são copiados; a candidatura aponta para o perfil atual.
export const jobApplications = pgTable(
  "job_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: applicationStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("job_applications_job_candidate_unique").on(
      table.jobId,
      table.candidateId,
    ),
    index("job_applications_candidate_id_idx").on(table.candidateId),
    index("job_applications_created_at_idx").on(table.createdAt),
  ],
);

export type JobApplication = typeof jobApplications.$inferSelect;
