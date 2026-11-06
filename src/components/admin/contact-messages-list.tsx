"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Check,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
} from "lucide-react";

import { setContactMessageStatus } from "@/app/[locale]/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactMessage } from "@/db/schema";
import { localeLabels, type Locale } from "@/i18n/routing";
import { formatUsPhone } from "@/lib/profile/options";
import { whatsappHref } from "@/lib/site";

type Row = Pick<
  ContactMessage,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "subject"
  | "message"
  | "locale"
  | "status"
  | "createdAt"
  | "answeredAt"
>;

export function ContactMessagesList({
  rows,
  subjectLabels,
}: {
  rows: Row[];
  subjectLabels: Record<string, string>;
}) {
  const t = useTranslations("Admin.messages");

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {rows.map((row) => (
        <MessageCard
          key={row.id}
          row={row}
          subject={subjectLabels[row.subject] ?? row.subject}
        />
      ))}
    </ul>
  );
}

function MessageCard({ row, subject }: { row: Row; subject: string }) {
  const t = useTranslations("Admin.messages");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const isNew = row.status === "new";
  // Números dos EUA ficam em E.164; os demais, como a pessoa digitou.
  const usPhone = row.phone && /^\+1\d{10}$/.test(row.phone);

  function toggle() {
    setError(false);
    startTransition(async () => {
      const result = await setContactMessageStatus(
        row.id,
        isNew ? "answered" : "new",
      );
      if (!result.ok) setError(true);
    });
  }

  return (
    <li
      className={`rounded-2xl border bg-card p-5 ${isNew ? "border-primary/40 shadow-sm shadow-primary/5" : "border-border/80"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.name}</p>
            <Badge
              variant={isNew ? "default" : "secondary"}
              className={isNew ? "" : "bg-muted text-muted-foreground"}
            >
              {t(`statuses.${row.status}`)}
            </Badge>
            <Badge variant="outline">{subject}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {format.dateTime(row.createdAt, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {" · "}
            {t("locale")}: {localeLabels[row.locale as Locale] ?? row.locale}
            {row.answeredAt &&
              ` · ${t("answeredOn", {
                date: format.dateTime(row.answeredAt, { dateStyle: "medium" }),
              })}`}
          </p>
        </div>
        <Button
          size="sm"
          variant={isNew ? "default" : "outline"}
          onClick={toggle}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : isNew ? (
            <Check />
          ) : (
            <RotateCcw />
          )}
          {isNew ? t("markAnswered") : t("markNew")}
        </Button>
      </div>

      <p className="mt-4 text-sm whitespace-pre-line">{row.message}</p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/70 pt-3 text-sm">
        <a
          href={`mailto:${row.email}`}
          className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
        >
          <Mail className="size-4" />
          {row.email}
        </a>
        {row.phone && (
          <a
            href={`tel:${row.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
          >
            <Phone className="size-4" />
            {usPhone ? formatUsPhone(row.phone) : row.phone}
          </a>
        )}
        {row.phone && (
          <a
            href={whatsappHref(row.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle className="size-4" />
            {t("whatsapp")}
          </a>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{t("error")}</p>}
    </li>
  );
}
