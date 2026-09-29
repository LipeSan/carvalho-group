import { useTranslations } from "next-intl";
import { CircleCheck, CircleSlash } from "lucide-react";

import { Badge } from "@/components/ui/badge";

// Status com ícone + texto (nunca só cor).
export function StatusBadge({ status }: { status: "active" | "suspended" }) {
  const t = useTranslations("Admin.status");
  return status === "active" ? (
    <Badge
      variant="outline"
      className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
    >
      <CircleCheck />
      {t("active")}
    </Badge>
  ) : (
    <Badge variant="destructive">
      <CircleSlash />
      {t("suspended")}
    </Badge>
  );
}

export function RoleBadge({
  role,
}: {
  role: "candidate" | "employer" | "admin";
}) {
  const t = useTranslations("Admin.roles");
  return (
    <Badge
      variant={role === "admin" ? "default" : "secondary"}
      className={role === "admin" ? "" : "bg-accent text-accent-foreground"}
    >
      {t(role)}
    </Badge>
  );
}
