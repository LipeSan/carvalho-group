import { useTranslations } from "next-intl";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SERVICE_ICONS } from "@/components/services/service-icon";
import { Link } from "@/i18n/navigation";
import { formatUsPhone } from "@/lib/profile/options";
import { serviceHref, type ServiceSlug } from "@/lib/services";
import { siteContact, whatsappHref } from "@/lib/site";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto mb-12 max-w-2xl text-center"
          : "mb-10 max-w-2xl"
      }
    >
      <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-heading text-3xl font-medium text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted-foreground text-balance">{subtitle}</p>
      )}
    </div>
  );
}

export function ServiceCard({ slug }: { slug: ServiceSlug }) {
  const t = useTranslations("Services");
  const Icon = SERVICE_ICONS[slug];

  return (
    <Link
      href={serviceHref(slug)}
      className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-medium">
        {t(`items.${slug}.name`)}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {t(`items.${slug}.short`)}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {t("learnMore")}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

type Step = { title: string; description: string };

export function StepsSection() {
  const t = useTranslations("Services.page");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="border-y border-border/70 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow={t("stepsEyebrow")} title={t("stepsTitle")} />
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border/80 bg-card p-6"
            >
              <span className="font-heading text-3xl font-medium text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Faixa escura de contato no fim das páginas: canais diretos e o botão para
// o formulário (/contact), já com o serviço escolhido quando houver.
export function ContactSection({
  eyebrow,
  title,
  subtitle,
  service,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  service?: ServiceSlug;
}) {
  const t = useTranslations("Home.contact");

  const channels = [
    siteContact.whatsapp && {
      key: "whatsapp",
      icon: MessageCircle,
      label: t("whatsapp"),
      value: formatUsPhone(siteContact.whatsapp),
      href: whatsappHref(siteContact.whatsapp),
      external: true,
    },
    siteContact.phone && {
      key: "phone",
      icon: Phone,
      label: t("phone"),
      value: formatUsPhone(siteContact.phone),
      href: `tel:${siteContact.phone}`,
      external: false,
    },
    siteContact.email && {
      key: "email",
      icon: Mail,
      label: t("email"),
      value: siteContact.email,
      href: `mailto:${siteContact.email}`,
      external: false,
    },
  ].filter((channel) => !!channel);

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 rounded-3xl bg-ink p-8 text-ink-foreground sm:p-14 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] text-gold-soft uppercase">
              {eyebrow}
            </span>
            <h2 className="mt-3 font-heading text-3xl font-medium text-balance sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-ink-foreground/70">{subtitle}</p>
            <Button
              size="lg"
              className="mt-7 h-12 px-6"
              render={
                <Link
                  href={
                    service
                      ? { pathname: "/contact", query: { service } }
                      : "/contact"
                  }
                />
              }
            >
              {t("form")}
              <ArrowRight />
            </Button>
          </div>
          <ul className="flex flex-col gap-3">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <li key={channel.key}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <Icon className="size-5 shrink-0 text-gold-soft" />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-xs text-ink-foreground/60">
                        {channel.label}
                      </span>
                      <span className="truncate font-medium">
                        {channel.value}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
