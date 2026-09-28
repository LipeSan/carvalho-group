import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { ContractType } from "@/lib/mock-jobs";

// Uma cor por tipo de contrato, para bater o olho e diferenciar as vagas.
// Classes escritas por extenso para o Tailwind encontrá-las no build.
const CONTRACT_TYPE_STYLES: Record<
  ContractType,
  { badge: string; dot: string }
> = {
  fullTime: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  partTime: {
    badge:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  contract: {
    badge:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  temporary: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  internship: {
    badge:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

export function ContractTypeBadge({ type }: { type: ContractType }) {
  const t = useTranslations("Jobs.contractType");

  return (
    <Badge variant="outline" className={CONTRACT_TYPE_STYLES[type].badge}>
      {t(type)}
    </Badge>
  );
}

// Bolinha na mesma cor do badge, para a legenda nos filtros.
export function ContractTypeDot({ type }: { type: ContractType }) {
  return (
    <span
      aria-hidden
      className={`size-2 shrink-0 rounded-full ${CONTRACT_TYPE_STYLES[type].dot}`}
    />
  );
}
