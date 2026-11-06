import Image from "next/image";

import { Link } from "@/i18n/navigation";

// Logo da Carvalho Consulting Group usado em todos os headers (site, login,
// cadastro). Sempre leva para a home.
export function BrandLogo() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <Image
        src="/icon.png"
        alt="Carvalho Consulting Group"
        width={44}
        height={44}
        className="size-10 shrink-0 sm:size-11"
        priority
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-heading text-lg font-semibold tracking-wide text-foreground sm:text-xl">
          Carvalho
        </span>
        <span className="truncate text-[10px] font-medium tracking-[0.2em] text-primary uppercase sm:tracking-[0.3em]">
          Consulting Group
        </span>
      </span>
    </Link>
  );
}
