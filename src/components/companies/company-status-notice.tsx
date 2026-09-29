import { useTranslations } from "next-intl";
import { CircleCheck, CircleX, Clock } from "lucide-react";

import type { CompanyStatus } from "@/lib/companies/options";

const STYLES = {
  pending: {
    icon: Clock,
    tone: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  approved: {
    icon: CircleCheck,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  rejected: {
    icon: CircleX,
    tone: "border-destructive/30 bg-destructive/5 text-destructive",
  },
} as const;

// Aviso do status da empresa (painel e vagas). `compact` mostra só o texto
// sobre o que dá para fazer com as vagas.
export function CompanyStatusNotice({
  status,
  rejectionReason,
  compact = false,
}: {
  status: CompanyStatus;
  rejectionReason?: string | null;
  compact?: boolean;
}) {
  const t = useTranslations("EmployerDashboard");
  const { icon: Icon, tone } = STYLES[status];

  return (
    <section
      className={`flex items-start gap-4 rounded-2xl border p-5 ${tone}`}
    >
      <Icon className="mt-0.5 size-6 shrink-0" />
      <div>
        <h2 className="font-heading text-xl font-medium">
          {t(`status.${status}.title`)}
        </h2>
        <p className="mt-1 text-sm opacity-90">
          {compact ? t(`jobsNotice.${status}`) : t(`status.${status}.text`)}
        </p>
        {!compact && status === "rejected" && rejectionReason && (
          <p className="mt-3 rounded-lg bg-background/60 px-3 py-2 text-sm">
            <span className="font-medium">{t("reason")}</span> {rejectionReason}
          </p>
        )}
      </div>
    </section>
  );
}
