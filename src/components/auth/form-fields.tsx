"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthErrorCode } from "@/lib/auth/form-state";

type FieldProps = Omit<React.ComponentProps<typeof Input>, "id" | "name"> & {
  name: string;
  label: string;
  icon: LucideIcon;
  error?: AuthErrorCode;
  labelAction?: React.ReactNode;
  // Conteúdo posicionado no fim do input (ex.: botão de mostrar senha).
  endAdornment?: React.ReactNode;
};

export function TextField({
  name,
  label,
  icon: Icon,
  error,
  labelAction,
  endAdornment,
  defaultValue,
  className,
  ...props
}: FieldProps) {
  const t = useTranslations("Auth.errors");
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          // A key força o remount para restaurar o valor após o reset do
          // formulário que o React faz ao concluir a action.
          key={String(defaultValue ?? "")}
          id={name}
          name={name}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 bg-card pl-9 ${className ?? ""}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {t(error)}
        </p>
      )}
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
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-1 h-11">
      {pending && <Loader2 className="animate-spin" />}
      {pending ? pendingLabel : label}
    </Button>
  );
}
