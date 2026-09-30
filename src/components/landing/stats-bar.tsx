import { getFormatter, getTranslations } from "next-intl/server";

import { getPlatformStats } from "@/lib/platform/stats";

// Números reais da plataforma (home e página para empresas). Número baixo
// ("1 empresa parceira") mais afasta do que convence, então cada um só
// aparece a partir de STAT_MIN_TO_SHOW; sem nenhum, a barra some.
const STAT_MIN_TO_SHOW = 10;

export async function StatsBar() {
  const [t, format, stats] = await Promise.all([
    getTranslations("Stats"),
    getFormatter(),
    getPlatformStats(),
  ]);

  const items = (
    [
      ["activeJobs", stats.activeJobs],
      ["partnerCompanies", stats.partnerCompanies],
      ["registeredCandidates", stats.registeredCandidates],
      ["hires", stats.hires],
    ] as const
  ).filter(([, value]) => value >= STAT_MIN_TO_SHOW);
  if (items.length === 0) return null;

  return (
    <section className="bg-ink text-ink-foreground">
      <div
        className={`mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:[grid-template-columns:repeat(var(--stat-cols),minmax(0,1fr))] ${
          items.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}
        style={{ "--stat-cols": items.length } as React.CSSProperties}
      >
        {items.map(([key, value], index) => (
          <div
            key={key}
            className={`text-center ${
              index !== 0 ? "md:border-l md:border-white/10" : ""
            }`}
          >
            <p className="font-heading text-3xl font-medium text-gold-soft sm:text-4xl">
              {format.number(value, {
                notation: "compact",
                maximumFractionDigits: 1,
              })}
            </p>
            <p className="mt-1 text-sm tracking-wide text-ink-foreground/70">
              {t(key)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
