import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

// Banner de abertura da home e das páginas de serviço: texto à esquerda,
// imagem à direita e o logo decorativo ao fundo. Sem `image`, mostra a foto
// da CEO com a legenda.
export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  actions,
  image,
  tagline,
  compactTitle = false,
}: {
  eyebrow: ReactNode;
  // Linha curta abaixo do selo (ex.: nome do serviço em inglês).
  tagline?: string;
  // Títulos longos ficam um pouco menores para não ocupar a tela toda.
  compactTitle?: boolean;
  title: ReactNode;
  subtitle: string;
  actions?: ReactNode;
  image?: { src: string; alt: string };
}) {
  const t = useTranslations("Home.hero");

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(ellipse_120%_80%_at_30%_-10%,var(--accent),transparent)]">
      {/* Logo decorativo atrás do texto (a foto ocupa a direita). */}
      <Image
        src="/logo-mark.png"
        alt=""
        aria-hidden
        width={900}
        height={900}
        className="pointer-events-none absolute -top-40 -left-48 hidden opacity-[0.05] md:block"
        priority
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-24">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            {eyebrow}
          </span>
          {tagline && (
            <p className="mt-4 font-heading text-lg text-muted-foreground italic">
              {tagline}
            </p>
          )}
          <h1
            className={
              compactTitle
                ? "mt-5 font-heading text-[2rem] leading-tight font-medium text-balance sm:text-[2.5rem] lg:text-[2.75rem] lg:leading-[1.12]"
                : "mt-6 font-heading text-4xl font-medium text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]"
            }
          >
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-balance lg:mx-0">
            {subtitle}
          </p>
          {actions && (
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              {actions}
            </div>
          )}
        </div>

        <figure className="relative mx-auto w-full max-w-[22rem] sm:max-w-sm lg:max-w-none">
          {/* Moldura dourada deslocada, no tom do cartão da marca. */}
          <div
            aria-hidden
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-primary/40 sm:translate-x-4 sm:translate-y-4"
          />
          <div className="relative overflow-hidden rounded-[2rem] bg-muted shadow-2xl shadow-primary/15">
            <Image
              src={image?.src ?? "/images/grazi-carvalho.jpg"}
              alt={image?.alt ?? t("photoAlt")}
              width={image ? 1024 : 575}
              height={image ? 1280 : 870}
              sizes="(min-width: 1024px) 460px, 384px"
              className="aspect-[4/5] w-full object-cover object-top"
              priority
            />
          </div>
          {!image && (
            <figcaption className="absolute -bottom-5 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-2xl border border-border/80 bg-card/95 px-5 py-3 whitespace-nowrap shadow-lg backdrop-blur lg:-left-6 lg:translate-x-0">
              <Image
                src="/logo-mark.png"
                alt=""
                aria-hidden
                width={32}
                height={32}
                className="size-8"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-heading text-base font-medium">
                  Grazi Carvalho
                </span>
                <span className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
                  {t("photoRole")}
                </span>
              </span>
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
