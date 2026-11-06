// Serviços da Carvalho Consulting Group. Os textos ficam em messages/*.json
// (Services.items.<slug>); a ordem aqui é a ordem do menu, da home e do rodapé.

// Serviços com página própria em /services/[slug].
export const consultingServiceSlugs = [
  "business-consulting",
  "personal-advisory",
  "life-insurance",
] as const;

export type ConsultingServiceSlug = (typeof consultingServiceSlugs)[number];

// O portal de vagas também é um serviço, mas tem página própria (/services/jobs).
export type ServiceSlug = ConsultingServiceSlug | "jobs";

export const serviceSlugs: readonly ServiceSlug[] = [
  ...consultingServiceSlugs,
  "jobs",
];

export function serviceHref(slug: ServiceSlug) {
  return `/services/${slug}`;
}

export function isConsultingServiceSlug(
  value: string,
): value is ConsultingServiceSlug {
  return (consultingServiceSlugs as readonly string[]).includes(value);
}

// Imagem do banner de cada serviço (public/images/services, retrato 4:5,
// 1024x1280). Serviço sem imagem aqui usa a foto da CEO.
export const serviceBannerImages: Partial<
  Record<ConsultingServiceSlug, string>
> = {
  "business-consulting": "/images/services/business-consulting-v2.jpg",
  "personal-advisory": "/images/services/personal-advisory-v2.jpg",
  "life-insurance": "/images/services/life-insurance-v1.jpg",
};
