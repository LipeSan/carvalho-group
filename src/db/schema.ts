import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["candidate", "employer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // Sempre salvo em minúsculas (ver normalizeEmail) para o índice único
  // valer independentemente de como o usuário digitou.
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("candidate"),
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

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
