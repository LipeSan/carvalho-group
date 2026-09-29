import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Link } from "@/i18n/navigation";
import type { LegalBlock, LegalDocument } from "@/content/legal/types";

// Destaca os trechos [entre colchetes]: são dados a preencher (razão social,
// email de contato…) e precisam ficar fáceis de achar enquanto existirem.
function WithPlaceholders({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, index) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <mark
            key={index}
            className="rounded bg-amber-100 px-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (Array.isArray(block)) {
    return (
      <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-primary">
        {block.map((item) => (
          <li key={item}>
            <WithPlaceholders text={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p>
      <WithPlaceholders text={block} />
    </p>
  );
}

// Página de documento legal (Termos de Uso, Política de Privacidade…):
// sumário lateral, seções com âncoras e aviso quando é uma tradução.
export function LegalPage({
  document,
  path,
  related,
}: {
  document: LegalDocument;
  // Outro documento legal citado no texto (ex.: Termos ↔ Privacidade).
  related?: { href: string; label: string };
  // Caminho da página, para o link da versão oficial em inglês.
  path: string;
}) {
  const t = useTranslations("Legal");
  const locale = useLocale();
  const format = useFormatter();
  const updatedAt = format.dateTime(
    new Date(`${document.updatedAt}T00:00:00Z`),
    {
      dateStyle: "long",
      timeZone: "UTC",
    },
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="border-b border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h1 className="font-heading text-4xl font-medium">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("updatedAt", { date: updatedAt })}
          </p>
          {locale !== "en" && (
            <p className="mt-5 flex max-w-3xl items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <Languages className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                {t.rich("translationNotice", {
                  link: (chunks) => (
                    <Link
                      href={path}
                      locale="en"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav aria-label={t("contents")}>
            <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-primary uppercase">
              {t("contents")}
            </p>
            <ol className="flex flex-col gap-1 text-sm">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="flex max-w-3xl flex-col gap-10 leading-relaxed text-foreground/90">
          <div className="flex flex-col gap-4">
            {document.intro.map((paragraph) => (
              <p key={paragraph}>
                <WithPlaceholders text={paragraph} />
              </p>
            ))}
          </div>
          {document.sections.map((section) => (
            // scroll-mt compensa a navbar fixa ao pular para a âncora.
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-heading text-2xl font-medium text-foreground">
                {section.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </div>
            </section>
          ))}
          {related && (
            <p className="border-t border-border pt-6 text-sm text-muted-foreground">
              {t("seeAlso")}{" "}
              <Link
                href={related.href}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {related.label}
              </Link>
            </p>
          )}
        </article>
      </div>
      <Footer />
    </div>
  );
}
