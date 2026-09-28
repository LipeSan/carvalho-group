import Image from "next/image";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function EmployerCta() {
  const t = useTranslations("EmployerCta");
  const benefits = t.raw("benefits") as string[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-ink p-10 text-ink-foreground sm:p-14 md:grid-cols-2">
        <Image
          src="/logo-mark.png"
          alt=""
          aria-hidden
          width={700}
          height={700}
          className="pointer-events-none absolute -right-24 -bottom-24 opacity-10"
        />

        <div className="relative">
          <span className="text-xs font-semibold tracking-[0.2em] text-gold-soft uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink-foreground/70">{t("subtitle")}</p>
          <Button
            size="lg"
            className="mt-7"
            render={<Link href="/employers/post-job" />}
          >
            {t("cta")}
          </Button>
        </div>

        <ul className="relative flex flex-col gap-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-soft" />
              <span className="text-ink-foreground/85">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
