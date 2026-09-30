"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

// Botão de envio do formulário de candidatura, desativado enquanto envia.
export function ApplyButton() {
  const t = useTranslations("JobDetail");
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
      {pending && <LoaderCircle className="animate-spin" />}
      {pending ? t("applying") : t("apply")}
    </Button>
  );
}
