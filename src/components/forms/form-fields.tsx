"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Campos compartilhados pelos formulários (autenticação, perfil...). O erro
// chega já traduzido: cada formulário sabe de qual namespace vêm as mensagens.

function FieldLabel({
  htmlFor,
  label,
  optionalLabel,
  action,
}: {
  htmlFor: string;
  label: string;
  optionalLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {optionalLabel && (
          <span className="ml-1.5 font-normal text-muted-foreground">
            {optionalLabel}
          </span>
        )}
      </label>
      {action}
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {error}
    </p>
  );
}

type FieldProps = Omit<React.ComponentProps<typeof Input>, "id" | "name"> & {
  name: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  // Texto ao lado da label, ex.: "(opcional)".
  optionalLabel?: string;
  labelAction?: React.ReactNode;
  // Conteúdo posicionado no fim do input (ex.: botão de mostrar senha).
  endAdornment?: React.ReactNode;
};

export function TextField({
  name,
  label,
  icon: Icon,
  error,
  optionalLabel,
  labelAction,
  endAdornment,
  defaultValue,
  className,
  ...props
}: FieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel
        htmlFor={name}
        label={label}
        optionalLabel={optionalLabel}
        action={labelAction}
      />
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          // A key força o remount para restaurar o valor após o reset do
          // formulário que o React faz ao concluir a action.
          key={String(defaultValue ?? "")}
          id={name}
          name={name}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 bg-card ${Icon ? "pl-9" : ""} ${className ?? ""}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function PasswordField(
  props: Omit<FieldProps, "icon" | "type" | "defaultValue">,
) {
  const t = useTranslations("Auth.fields");
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      icon={Lock}
      type={visible ? "text" : "password"}
      className="pr-10"
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          className="text-muted-foreground"
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      }
    />
  );
}

// Select nativo: no celular abre o seletor do sistema, que é o mais usável
// para listas longas como a de estados.
export function SelectField({
  name,
  label,
  placeholder,
  options,
  defaultValue,
  error,
  optionalLabel,
  autoComplete,
  value,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  error?: string;
  optionalLabel?: string;
  autoComplete?: string;
  // Modo controlado, quando outro campo precisa alterar este (ex.: o
  // autocomplete de endereço preenchendo o estado).
  value?: string;
  onChange?: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  const valueProps =
    value !== undefined
      ? {
          value,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange?.(e.target.value),
        }
      : { key: defaultValue ?? "", defaultValue: defaultValue ?? "" };

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={name} label={label} optionalLabel={optionalLabel} />
      <div className="relative">
        <select
          {...valueProps}
          id={name}
          name={name}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-11 w-full appearance-none rounded-lg border border-input bg-card px-2.5 pr-9 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function CheckboxField({
  name,
  children,
  defaultChecked,
  error,
}: {
  name: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
  error?: string;
}) {
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-2.5 text-sm">
        <input
          key={String(defaultChecked ?? false)}
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span className="text-muted-foreground">{children}</span>
      </label>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

// Pergunta de sim/não com dois botões de rádio lado a lado.
export function YesNoField({
  name,
  label,
  yesLabel,
  noLabel,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  yesLabel: string;
  noLabel: string;
  defaultValue?: boolean | null;
  error?: string;
}) {
  const errorId = `${name}-error`;
  const current =
    defaultValue === true ? "yes" : defaultValue === false ? "no" : "";

  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-3" key={current}>
        {[
          { value: "yes", label: yesLabel },
          { value: "no", label: noLabel },
        ].map((option) => (
          <label
            key={option.value}
            className="flex h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-card px-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={current === option.value}
              className="size-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} error={error} />
    </fieldset>
  );
}

export function FormAlert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success";
  children: React.ReactNode;
}) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={
        variant === "error"
          ? "flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
          : "flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-3 text-sm text-foreground"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function SubmitButton({
  pending,
  label,
  pendingLabel,
  className,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className={`mt-1 h-11 ${className ?? ""}`}
    >
      {pending && <Loader2 className="animate-spin" />}
      {pending ? pendingLabel : label}
    </Button>
  );
}
