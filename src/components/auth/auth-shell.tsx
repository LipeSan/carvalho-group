import Image from "next/image";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { LanguageSwitcher } from "@/components/landing/language-switcher";
import { Link } from "@/i18n/navigation";

// Layout comum das telas de login, cadastro e recuperação de senha.
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("Auth");
  const highlights = t.raw("highlights") as string[];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Carvalho Group"
              width={44}
              height={44}
              className="size-10"
              priority
            />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg font-semibold tracking-wide text-foreground">
                Carvalho Group
              </span>
              <span className="text-[10px] font-medium tracking-[0.3em] text-primary uppercase">
                Jobs
              </span>
            </span>
          </Link>
          <LanguageSwitcher />
        </div>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="font-heading text-3xl font-medium sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-end lg:p-14">
        <Image
          src="/logo-mark.png"
          alt=""
          aria-hidden
          width={800}
          height={800}
          className="pointer-events-none absolute -right-32 -top-32 opacity-10"
        />
        <div className="relative max-w-md">
          <span className="text-xs font-semibold tracking-[0.2em] text-gold-soft uppercase">
            {t("asideEyebrow")}
          </span>
          <p className="mt-4 font-heading text-4xl font-medium text-balance">
            {t("asideTitle")}
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-soft" />
                <span className="text-ink-foreground/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkLabel,
  href,
}: {
  text: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      {text}{" "}
      <Link
        href={href}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
