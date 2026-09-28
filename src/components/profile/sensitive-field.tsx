"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";

// Campo para documento (SSN, passaporte): digitado mascarado, com opção de
// mostrar. O valor salvo nunca vem do servidor; só a versão mascarada
// (ex.: •••-••-1234) aparece como referência. Deixar vazio mantém o salvo.
export function SensitiveField({
  name,
  label,
  placeholder,
  icon,
  savedMasked,
  inputMode,
  maxLength,
  error,
}: {
  name: string;
  label: string;
  placeholder: string;
  icon: LucideIcon;
  savedMasked?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  error?: string;
}) {
  const t = useTranslations("Profile");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <TextField
        name={name}
        label={label}
        optionalLabel={t("optional")}
        icon={icon}
        type={visible ? "text" : "password"}
        inputMode={inputMode}
        maxLength={maxLength}
        // Evita que o navegador ofereça salvar o documento como senha.
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        placeholder={savedMasked ? t("documents.keepSaved") : placeholder}
        className="pr-10"
        error={error}
        endAdornment={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t("documents.hide") : t("documents.show")}
            aria-pressed={visible}
            className="text-muted-foreground"
          >
            {visible ? <EyeOff /> : <Eye />}
          </Button>
        }
      />
      {savedMasked && (
        <p className="text-xs text-muted-foreground">
          {t("documents.saved", { value: savedMasked })}
        </p>
      )}
    </div>
  );
}
