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
