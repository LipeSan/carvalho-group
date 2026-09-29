import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { FormSelect } from "@/components/forms/form-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

// Barra de filtros das listas do admin: formulário GET (os filtros ficam na
// URL e voltar/avançar do navegador funciona).
export function FilterBar({
  path,
  query,
  searchPlaceholder,
  selects,
}: {
  // Caminho sem o idioma, ex.: "/admin/candidates".
  path: string;
  query?: string;
  searchPlaceholder?: string;
  selects: {
    name: string;
    label: string;
    value?: string;
    options: { value: string; label: string }[];
  }[];
}) {
  const t = useTranslations("Lists");
  const locale = useLocale();

  const buttons = (
    <div className="flex shrink-0 gap-2">
      <Button type="submit" className="h-10 flex-1 px-4 sm:flex-none">
        {t("apply")}
      </Button>
      <Button variant="ghost" className="h-10" render={<Link href={path} />}>
        {t("clear")}
      </Button>
    </div>
  );

  // Selects numa grade de colunas iguais: todos lado a lado no desktop,
  // dois por linha no celular.
  const selectGrid = (
    <div
      className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:[grid-template-columns:repeat(var(--filter-cols),minmax(0,1fr))]"
      style={{ "--filter-cols": selects.length } as React.CSSProperties}
    >
      {selects.map((select) => (
        <FormSelect
          key={select.name}
          name={select.name}
          options={select.options}
          placeholder={select.label}
          clearLabel={t("all")}
          defaultValue={select.value}
          aria-label={select.label}
          // Filtro ativo fica destacado: com um valor escolhido o nome do
          // filtro some, então a cor mostra que ele está aplicado.
          size="md"
          className="not-data-placeholder:border-primary/50 not-data-placeholder:bg-accent not-data-placeholder:font-medium not-data-placeholder:text-accent-foreground"
        />
      ))}
    </div>
  );

  return (
    <form
      // Os campos não são controlados: sem esta key, ao navegar (ex.:
      // "Limpar") o React reaproveitaria os campos com os valores antigos.
      // Mudando os filtros da URL, o formulário é recriado com os novos.
      key={JSON.stringify([query, ...selects.map((s) => s.value)])}
      action={`/${locale}${path}`}
      role="search"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3"
    >
      {searchPlaceholder ? (
        <>
          {/* Linha 1: busca + botões. Linha 2: filtros. */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-10 pl-9"
              />
            </div>
            {buttons}
          </div>
          {selectGrid}
        </>
      ) : (
        // Sem busca (ex.: auditoria), filtros e botões cabem numa linha.
        <div className="flex flex-col gap-3 sm:flex-row">
          {selectGrid}
          {buttons}
        </div>
      )}
    </form>
  );
}

export function Pagination({
  page,
  total,
  pageSize,
  hrefFor,
}: {
  page: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => {
    pathname: string;
    query: Record<string, string>;
  };
}) {
  const t = useTranslations("Lists");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("pagination")}
      className="mt-6 flex items-center justify-between gap-4 text-sm text-muted-foreground"
    >
      <span>{t("pageOf", { page, total: totalPages })}</span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("previous")}
          disabled={page <= 1}
          render={page > 1 ? <Link href={hrefFor(page - 1)} /> : undefined}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("next")}
          disabled={page >= totalPages}
          render={
            page < totalPages ? <Link href={hrefFor(page + 1)} /> : undefined
          }
        >
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}

// Lê um parâmetro da URL aceitando só valores conhecidos.
export function pickParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return allowed.includes(single as T) ? (single as T) : undefined;
}

export function textParam(
  value: string | string[] | undefined,
): string | undefined {
  const single = (Array.isArray(value) ? value[0] : value)?.trim();
  return single ? single.slice(0, 100) : undefined;
}

export function pageParam(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

// Remove chaves vazias para a URL ficar limpa.
export function cleanQuery(
  query: Record<string, string | number | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );
}
