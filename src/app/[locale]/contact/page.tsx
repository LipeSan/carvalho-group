import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Languages, Mail, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { contactSubjects } from "@/lib/contact/options";
import { formatUsPhone, isOneOf } from "@/lib/profile/options";
import { siteContact, whatsappHref } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContactPage({
  params,
  searchParams,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ?service=<slug> vem dos botões "Fale conosco" das páginas de serviço.
  const { service } = await searchParams;
  const defaultSubject = isOneOf(contactSubjects, service)
    ? service
    : undefined;

  const [t, tServices] = await Promise.all([
    getTranslations("Contact"),
    getTranslations("Services.items"),
  ]);

  const subjects = contactSubjects.map((subject) => ({
    value: subject,
    label:
      subject === "other"
        ? t("form.subjectOther")
        : tServices(`${subject}.name`),
  }));

  const channels = [
    siteContact.whatsapp && {
      key: "whatsapp",
      icon: MessageCircle,
      label: t("channels.whatsapp"),
      value: formatUsPhone(siteContact.whatsapp),
      hint: t("channels.whatsappHint"),
      href: whatsappHref(siteContact.whatsapp),
      external: true,
    },
    siteContact.phone && {
      key: "phone",
      icon: Phone,
      label: t("channels.phone"),
      value: formatUsPhone(siteContact.phone),
      hint: t("channels.phoneHint"),
      href: `tel:${siteContact.phone}`,
      external: false,
    },
    siteContact.email && {
      key: "email",
      icon: Mail,
      label: t("channels.email"),
      value: siteContact.email,
      hint: t("channels.emailHint"),
      href: `mailto:${siteContact.email}`,
      external: false,
    },
  ].filter((channel) => !!channel);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Abertura */}
        <section className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_30%_-10%,var(--accent),transparent)]">
          <Image
            src="/logo-mark.png"
            alt=""
            aria-hidden
            width={900}
            height={900}
            className="pointer-events-none absolute -top-40 -right-40 hidden opacity-[0.05] md:block"
            priority
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              {t("eyebrow")}
            </span>
            <h1 className="mt-6 font-heading text-4xl font-medium text-balance sm:text-5xl">
              {t.rich("title", {
                highlight: (chunks) => (
                  <span className="text-primary">{chunks}</span>
                ),
              })}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-balance lg:mx-0">
              {t("subtitle")}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-14 lg:py-20">
          {/* Canais diretos */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl font-medium">
              {t("channels.title")}
            </h2>
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
                      className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <Icon className="size-5" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
                          {channel.label}
                        </span>
                        <span className="truncate font-heading text-lg font-medium">
                          {channel.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {channel.hint}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
              <Languages className="mt-0.5 size-4 shrink-0 text-primary" />
              {t("channels.languages")}
            </p>
          </div>

          {/* Formulário */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
            <h2 className="font-heading text-2xl font-medium">
              {t("form.title")}
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              {t("form.subtitle")}
            </p>
            <ContactForm subjects={subjects} defaultSubject={defaultSubject} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
