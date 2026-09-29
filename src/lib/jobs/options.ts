// Vocabulário fixo das vagas. Os slugs são salvos no banco e traduzidos pela
// interface (messages/*.json); o conteúdo escrito pela empresa (título,
// descrição...) não é traduzido.

export const categorySlugs = [
  "plasterer",
  "cleaningHelper",
  "attendant",
  "cook",
  "cashier",
  "construction",
  "painter",
  "bartender",
] as const;
export type CategorySlug = (typeof categorySlugs)[number];

// Tipos de contrato dos EUA. "contract" é o autônomo pago via 1099.
export const contractTypes = [
  "fullTime",
  "partTime",
  "contract",
  "temporary",
  "internship",
] as const;
export type ContractType = (typeof contractTypes)[number];

export const workModes = ["onsite", "hybrid", "remote"] as const;
export type WorkMode = (typeof workModes)[number];

export const payPeriods = ["hour", "year"] as const;
export type PayPeriod = (typeof payPeriods)[number];

// draft: só o admin vê. published: aparece no site. closed: saiu do site,
// mas fica no histórico.
export const jobStatuses = ["draft", "published", "closed"] as const;
export type JobStatus = (typeof jobStatuses)[number];

// Dados públicos de uma vaga, no formato usado pelos cards. Nenhuma
// informação do employer é exposta, conforme regra da plataforma.
export type PublicJob = {
  id: string;
  title: string;
  categorySlug: CategorySlug;
  // Sempre "Cidade, UF".
  location: string;
  workMode: WorkMode;
  contractType: ContractType;
  salaryRange?: string;
  postedAgoDays: number;
};

export type JobDetails = PublicJob & {
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  schedule: string | null;
};
