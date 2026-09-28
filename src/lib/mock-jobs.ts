export type WorkMode = "remote" | "hybrid" | "onsite";
export type ContractType = "clt" | "pj" | "internship" | "temporary";
export type CategorySlug =
  | "technology"
  | "sales"
  | "marketing"
  | "administrative"
  | "design"
  | "finance"
  | "humanResources"
  | "operations";

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
  location: string;
  workMode: WorkMode;
  contractType: ContractType;
  salaryRange?: string;
  postedAgoDays: number;
};

export const featuredJobs: PublicJob[] = [
  {
    id: "1",
    title: "Desenvolvedor(a) Front-end React",
    categorySlug: "technology",
    location: "São Paulo, SP",
    workMode: "hybrid",
    contractType: "clt",
    salaryRange: "R$ 7.000 - R$ 10.000",
    postedAgoDays: 2,
  },
  {
    id: "2",
    title: "Analista de Marketing Digital",
    categorySlug: "marketing",
    location: "Belo Horizonte, MG",
    workMode: "remote",
    contractType: "clt",
    salaryRange: "R$ 4.500 - R$ 6.000",
    postedAgoDays: 3,
  },
  {
    id: "3",
    title: "Executivo(a) de Vendas B2B",
    categorySlug: "sales",
    location: "Rio de Janeiro, RJ",
    workMode: "onsite",
    contractType: "clt",
    salaryRange: "R$ 5.000 + comissão",
    postedAgoDays: 1,
  },
  {
    id: "4",
    title: "UX/UI Designer Pleno",
    categorySlug: "design",
    location: "Curitiba, PR",
    workMode: "remote",
    contractType: "pj",
    salaryRange: "R$ 6.500 - R$ 9.000",
    postedAgoDays: 5,
  },
  {
    id: "5",
    title: "Analista Financeiro Jr.",
    categorySlug: "finance",
    location: "Porto Alegre, RS",
    workMode: "onsite",
    contractType: "clt",
    salaryRange: "R$ 3.200 - R$ 4.000",
    postedAgoDays: 4,
  },
  {
    id: "6",
    title: "Estágio em Recursos Humanos",
    categorySlug: "humanResources",
    location: "São Paulo, SP",
    workMode: "hybrid",
    contractType: "internship",
    salaryRange: "R$ 1.800",
    postedAgoDays: 6,
  },
];

export type JobCategory = {
  slug: CategorySlug;
  count: number;
};

export const jobCategories: JobCategory[] = [
  { slug: "technology", count: 184 },
  { slug: "sales", count: 132 },
  { slug: "marketing", count: 97 },
  { slug: "administrative", count: 88 },
  { slug: "design", count: 64 },
  { slug: "finance", count: 59 },
  { slug: "humanResources", count: 41 },
  { slug: "operations", count: 76 },
];
