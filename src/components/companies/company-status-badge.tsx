import { useTranslations } from "next-intl";
import { CircleCheck, CircleX, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CompanyStatus } from "@/lib/companies/options";

// Status com ícone + texto (nunca só cor).
export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const t = useTranslations("CompanyStatus");

  if (status === "approved") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      >
        <CircleCheck />
        {t("approved")}
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge
        variant="outline"
        className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
      >
        <Clock />
        {t("pending")}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <CircleX />
      {t("rejected")}
    </Badge>
  );
}
