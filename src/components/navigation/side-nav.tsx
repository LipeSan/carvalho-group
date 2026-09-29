"use client";

import type { LucideIcon } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";

export type SideNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // Só fica ativo na rota exata (ex.: a página inicial da área). Os demais
  // também ficam ativos nas subpáginas (ex.: /admin/jobs/12/edit).
  exact?: boolean;
};

// Menu lateral das áreas logadas (admin e empresa). No celular vira uma
// faixa horizontal com rolagem.
export function SideNav({
  items,
  label,
}: {
  items: SideNavItem[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
