"use client";

import { cn } from "cn";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

// Select estilizado (Base UI) para formulários. Envia o valor pelo `name`
// como um <select> comum, então funciona com server actions e formulários GET.
//
// Pode ser não controlado (defaultValue) ou controlado (value +
// onValueChange). Com `clearLabel`, ganha uma primeira opção que volta ao
// placeholder (ex.: "Todos" nos filtros).
export function FormSelect({
  name,
  options,
  placeholder,
  defaultValue,
  value,
  onValueChange,
  clearLabel,
  id,
  size = "lg",
  className,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  name: string;
  options: SelectOption[];
  placeholder: string;
  defaultValue?: string | null;
  value?: string;
  onValueChange?: (value: string) => void;
  clearLabel?: string;
  id?: string;
  // Mesma altura dos inputs: "lg" (h-11) nos formulários, "md" (h-10) nas
  // barras de filtro.
  size?: "md" | "lg";
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  // `items` serve para o Base UI achar o rótulo do valor escolhido. A opção
  // de limpar (valor null) fica de fora de propósito: assim, sem filtro, o
  // botão mostra o placeholder (ex.: "Estado") e não "Todos".
  const items = options;

  const valueProps =
    value !== undefined
      ? {
          value: value || null,
          onValueChange: (next: string | null | undefined) =>
            onValueChange?.(next ?? ""),
        }
      : { defaultValue: defaultValue || null };

  return (
    <Select name={name} items={items} {...valueProps}>
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn("w-full min-w-0 bg-card", className)}
      >
        <SelectValue placeholder={placeholder} className="truncate" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-72">
        {clearLabel && (
          <SelectItem value={null} className="text-muted-foreground">
            {clearLabel}
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
