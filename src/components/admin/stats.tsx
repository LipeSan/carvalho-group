import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

// Card de número do painel: o número é o "gráfico". A variação vem com
// seta + texto, nunca só pela cor.
export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: number; label: string };
}) {
  const DeltaIcon =
    delta && delta.value > 0
      ? ArrowUpRight
      : delta && delta.value < 0
        ? ArrowDownRight
        : ArrowRight;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-medium tabular-nums">
        {value}
      </p>
      {delta ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <DeltaIcon className="size-3.5 text-foreground" aria-hidden />
          {delta.label}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// Colunas ao longo do tempo (uma série, uma cor). Cada coluna ocupa a altura
// toda como área de hover/foco, maior que a própria barra, e mostra a dica
// com o valor exato. A tabela escondida repete os dados para leitores de tela.
export function ColumnChart({
  title,
  summary,
  items,
  tableCaption,
  labels,
}: {
  title: string;
  summary: string;
  items: { key: string; label: string; value: number; tooltip: string }[];
  tableCaption: string;
  // Rótulos do eixo X: primeiro, meio e último item.
  labels: [string, string, string];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-xs text-muted-foreground">{summary}</p>
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-3" aria-hidden>
        <div className="flex h-52 flex-col justify-between text-right text-[11px] text-muted-foreground tabular-nums">
          <span className="-translate-y-1/2">{max}</span>
          <span className="translate-y-1/2">0</span>
        </div>
        <div className="relative h-52 border-b border-border">
          <span className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {items.map((item, index) => {
              const edge =
                index < 3
                  ? "left-0"
                  : index > items.length - 4
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2";
              return (
                <div
                  key={item.key}
                  tabIndex={0}
                  className="group relative flex h-full min-w-0 flex-1 items-end rounded-sm outline-none hover:bg-muted/60 focus-visible:bg-muted/60"
                >
                  <span
                    className="block w-full rounded-t-[4px] bg-primary"
                    style={{ height: `${(item.value / max) * 100}%` }}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-full z-10 mb-1.5 hidden rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block group-focus-visible:block ${edge}`}
                  >
                    {item.tooltip}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <span />
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>{tableCaption}</caption>
        <tbody>
          {items.map((item) => (
            <tr key={item.key}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// Lista ordenada com barras horizontais (uma série só, então uma cor só e
// sem legenda). O valor fica escrito na ponta, em cor de texto; a barra usa a
// cor da marca. Como é uma lista com rótulo + valor, já serve de tabela para
// leitores de tela.
export function BarList({
  title,
  items,
  emptyLabel,
  valueLabel,
}: {
  title: string;
  items: { key: string; label: string; value: number }[];
  emptyLabel: string;
  valueLabel: (value: number, share: number) => string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-6 mb-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => {
            const share = total ? item.value / total : 0;
            return (
              <li
                key={item.key}
                // Dica ao passar o mouse com o valor e a participação.
                title={`${item.label}: ${valueLabel(item.value, share)}`}
                className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  {item.label}
                </span>
                <span className="h-2 rounded-r-[4px] bg-muted" aria-hidden>
                  <span
                    className="block h-full rounded-r-[4px] bg-primary"
                    style={{ width: `${(item.value / max) * 100}%` }}
                  />
                </span>
                <span className="w-8 text-right font-medium tabular-nums">
                  {item.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
