// Sem imports com "@/": este arquivo é lido pelo drizzle-kit (src/db/schema).
import type { ServiceSlug } from "../services";

// Assunto da mensagem: um dos serviços ou "outro". Fica no banco como enum.
export const contactSubjects = [
  "business-consulting",
  "personal-advisory",
  "life-insurance",
  "jobs",
  "other",
] as const;
export type ContactSubject = (typeof contactSubjects)[number];

// Garante que a lista acompanhe os serviços de lib/services.
type MissingService = Exclude<ServiceSlug, ContactSubject>;
const _allServicesCovered: MissingService extends never ? true : never = true;
void _allServicesCovered;

// "new": ainda não respondida. A equipe marca como "answered" no admin.
export const contactMessageStatuses = ["new", "answered"] as const;
export type ContactMessageStatus = (typeof contactMessageStatuses)[number];

export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  phone: 30,
  messageMin: 10,
  messageMax: 4000,
  // Máximo de mensagens do mesmo email por hora (proteção contra spam).
  perEmailPerHour: 5,
} as const;
