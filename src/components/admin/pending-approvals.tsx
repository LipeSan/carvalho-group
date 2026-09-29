import { useFormatter, useTranslations } from "next-intl";
import { ChevronRight, CircleCheck, Clock } from "lucide-react";

import { Link } from "@/i18n/navigation";

type PendingCompany = {
  id: string;
  name: string;
  city: string;
  state: string;
  createdAt: Date;
};

// Fila de aprovação no topo do painel. O estado vem com ícone + texto, e a
// cor de alerta só aparece quando há algo a fazer.
export function PendingApprovals({
  total,
  companies,
}: {
  total: number;
  companies: PendingCompany[];
}) {
  const t = useTranslations("Admin.dashboard.pending");
  const format = useFormatter();
  const now = new Date();

  if (total === 0) {
    return (
      <section className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
        <CircleCheck
          className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium">{t("noneTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("noneHint")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900 dark:bg-amber-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Clock className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-medium">
              {t("title", { count: total })}
            </h2>
            <p className="text-xs text-muted-foreground">{t("hint")}</p>
          </div>
        </div>
        <Link
          href={{ pathname: "/admin/companies", query: { status: "pending" } }}
          className="text-sm font-medium text-amber-900 underline-offset-4 hover:underline dark:text-amber-200"
        >
          {t("viewAll")}
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-amber-200/70 overflow-hidden rounded-xl border border-amber-200/70 bg-card dark:divide-amber-900/70 dark:border-amber-900/70">
        {companies.map((company) => (
          <li key={company.id}>
            <Link
              href={`/admin/companies/${company.id}`}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {company.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {company.city}, {company.state}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {t("waiting", {
                  time: format.relativeTime(company.createdAt, now),
                })}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
