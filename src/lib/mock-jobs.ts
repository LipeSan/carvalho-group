export type WorkMode = "remote" | "hybrid" | "onsite";
// Tipos de contrato dos EUA. "contract" é o autônomo pago via 1099.
export const contractTypes = [
  "fullTime",
  "partTime",
  "contract",
  "temporary",
  "internship",
] as const;
export type ContractType = (typeof contractTypes)[number];

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

// Dados públicos da vaga apenas. Nenhuma informação do employer é exposta
// para o tipo de usuário "User", conforme regra de negócio da plataforma.
//
// Título, localização e faixa salarial são conteúdo real informado pela
// empresa (assim como em qualquer job board) e não são traduzidos
// automaticamente — apenas os rótulos de categoria, modalidade e tipo de
// contrato, que são um vocabulário fixo da plataforma, vêm dos arquivos de
// tradução em messages/*.json.
export type PublicJob = {
  id: string;
  title: string;
  categorySlug: CategorySlug;
  // Sempre "Cidade, UF" (sigla do estado).
  location: string;
  workMode: WorkMode;
  contractType: ContractType;
  salaryRange?: string;
  postedAgoDays: number;
};

// Dados de exemplo até existir o cadastro de vagas pelas empresas.
export const allJobs: PublicJob[] = [
  {
    id: "1",
    title: "Plasterer – Commercial Projects",
    categorySlug: "plasterer",
    location: "Orlando, FL",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$22 – $28/hr",
    postedAgoDays: 2,
  },
  {
    id: "2",
    title: "Cleaning Helper – Residential",
    categorySlug: "cleaningHelper",
    location: "Newark, NJ",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$17 – $19/hr",
    postedAgoDays: 1,
  },
  {
    id: "3",
    title: "Line Cook",
    categorySlug: "cook",
    location: "Boston, MA",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$19 – $23/hr",
    postedAgoDays: 3,
  },
  {
    id: "4",
    title: "Interior & Exterior Painter",
    categorySlug: "painter",
    location: "Charlotte, NC",
    workMode: "onsite",
    contractType: "contract",
    salaryRange: "$20 – $26/hr",
    postedAgoDays: 4,
  },
  {
    id: "5",
    title: "Bartender – Beach Restaurant",
    categorySlug: "bartender",
    location: "Miami, FL",
    workMode: "onsite",
    contractType: "partTime",
    salaryRange: "$12/hr + tips",
    postedAgoDays: 5,
  },
  {
    id: "6",
    title: "Construction Laborer",
    categorySlug: "construction",
    location: "Atlanta, GA",
    workMode: "onsite",
    contractType: "temporary",
    salaryRange: "$18 – $22/hr",
    postedAgoDays: 6,
  },
  {
    id: "7",
    title: "Drywall & Plaster Finisher",
    categorySlug: "plasterer",
    location: "Newark, NJ",
    workMode: "onsite",
    contractType: "contract",
    salaryRange: "$25 – $32/hr",
    postedAgoDays: 0,
  },
  {
    id: "8",
    title: "Commercial Cleaner – Night Shift",
    categorySlug: "cleaningHelper",
    location: "Orlando, FL",
    workMode: "onsite",
    contractType: "partTime",
    salaryRange: "$16 – $18/hr",
    postedAgoDays: 2,
  },
  {
    id: "9",
    title: "Hotel Housekeeping Attendant",
    categorySlug: "attendant",
    location: "Miami, FL",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$16 – $18/hr",
    postedAgoDays: 1,
  },
  {
    id: "10",
    title: "Front Desk Attendant",
    categorySlug: "attendant",
    location: "Framingham, MA",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$17 – $20/hr",
    postedAgoDays: 8,
  },
  {
    id: "11",
    title: "Prep Cook – Brazilian Steakhouse",
    categorySlug: "cook",
    location: "Orlando, FL",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$17 – $20/hr",
    postedAgoDays: 0,
  },
  {
    id: "12",
    title: "Breakfast Cook",
    categorySlug: "cook",
    location: "Danbury, CT",
    workMode: "onsite",
    contractType: "partTime",
    salaryRange: "$18 – $21/hr",
    postedAgoDays: 12,
  },
  {
    id: "13",
    title: "Cashier – Grocery Store",
    categorySlug: "cashier",
    location: "Newark, NJ",
    workMode: "onsite",
    contractType: "partTime",
    salaryRange: "$15 – $17/hr",
    postedAgoDays: 3,
  },
  {
    id: "14",
    title: "Cashier / Sales Associate",
    categorySlug: "cashier",
    location: "Houston, TX",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$14 – $16/hr",
    postedAgoDays: 20,
  },
  {
    id: "15",
    title: "Framing Carpenter Helper",
    categorySlug: "construction",
    location: "Austin, TX",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$19 – $24/hr",
    postedAgoDays: 4,
  },
  {
    id: "16",
    title: "Concrete Laborer",
    categorySlug: "construction",
    location: "Charlotte, NC",
    workMode: "onsite",
    contractType: "temporary",
    salaryRange: "$18 – $21/hr",
    postedAgoDays: 9,
  },
  {
    id: "17",
    title: "Roofing Crew Member",
    categorySlug: "construction",
    location: "Tampa, FL",
    workMode: "onsite",
    contractType: "contract",
    salaryRange: "$20 – $27/hr",
    postedAgoDays: 15,
  },
  {
    id: "18",
    title: "Residential Painter",
    categorySlug: "painter",
    location: "Framingham, MA",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$21 – $27/hr",
    postedAgoDays: 2,
  },
  {
    id: "19",
    title: "Painter Apprentice",
    categorySlug: "painter",
    location: "Atlanta, GA",
    workMode: "onsite",
    contractType: "internship",
    salaryRange: "$15/hr",
    postedAgoDays: 25,
  },
  {
    id: "20",
    title: "Bartender – Hotel Lounge",
    categorySlug: "bartender",
    location: "Boston, MA",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$15/hr + tips",
    postedAgoDays: 6,
  },
  {
    id: "21",
    title: "Event Bartender",
    categorySlug: "bartender",
    location: "Houston, TX",
    workMode: "onsite",
    contractType: "temporary",
    salaryRange: "$20/hr + tips",
    postedAgoDays: 1,
  },
  {
    id: "22",
    title: "Stucco & Plaster Specialist",
    categorySlug: "plasterer",
    location: "Tampa, FL",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$24 – $30/hr",
    postedAgoDays: 10,
  },
  {
    id: "23",
    title: "Janitor – Office Buildings",
    categorySlug: "cleaningHelper",
    location: "Austin, TX",
    workMode: "onsite",
    contractType: "fullTime",
    salaryRange: "$16 – $19/hr",
    postedAgoDays: 5,
  },
  {
    id: "24",
    title: "Parking Lot Attendant",
    categorySlug: "attendant",
    location: "Danbury, CT",
    workMode: "onsite",
    contractType: "partTime",
    salaryRange: "$16/hr",
    postedAgoDays: 35,
  },
];

// As 6 vagas mostradas na home.
export const featuredJobs: PublicJob[] = allJobs.slice(0, 6);

export type JobCategory = {
  slug: CategorySlug;
  count: number;
};

export const jobCategories: JobCategory[] = [
  { slug: "plasterer", count: 142 },
  { slug: "cleaningHelper", count: 218 },
  { slug: "attendant", count: 167 },
  { slug: "cook", count: 193 },
  { slug: "cashier", count: 124 },
  { slug: "construction", count: 256 },
  { slug: "painter", count: 131 },
  { slug: "bartender", count: 88 },
];
