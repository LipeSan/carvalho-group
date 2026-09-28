import { useTranslations } from "next-intl";

export function StatsBar() {
  const t = useTranslations("Stats");

  const stats = [
    { label: t("activeJobs"), value: "1.2k+" },
    { label: t("partnerCompanies"), value: "340+" },
    { label: t("registeredCandidates"), value: "58k+" },
    { label: t("hires"), value: "6.4k+" },
  ];

  return (
    <section className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`text-center ${
              index !== 0 ? "md:border-l md:border-white/10" : ""
            }`}
          >
            <p className="font-heading text-3xl font-medium text-gold-soft sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm tracking-wide text-ink-foreground/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
