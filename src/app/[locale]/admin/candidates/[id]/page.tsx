import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { AuditActionLabel } from "@/components/admin/audit-action-label";
import { StatusBadge } from "@/components/admin/badges";
import { RevealDocument } from "@/components/admin/reveal-document";
import { UserActions } from "@/components/admin/user-actions";
import { Link } from "@/i18n/navigation";
import { getCandidateForAdmin, listAuditLogs } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import {
  desiredRoles,
  educationLevels,
  formatUsPhone,
  isOneOf,
  isSuggestedSkill,
  maskPassportNumber,
  maskSsn,
} from "@/lib/profile/options";
import { getProfileCompletion, profileSteps } from "@/lib/profile/steps";

// IDs são UUID; qualquer outra coisa vira 404 sem ir ao banco.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/candidates/[id]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.candidates" });
  return { title: t("detailTitle") };
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <h2 className="border-b border-border px-5 py-3 text-sm font-medium">
        {title}
      </h2>
      <div className="px-5 py-2">{children}</div>
    </section>
  );
}

function Rows({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="divide-y divide-border">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <dt className="shrink-0 text-sm text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-sm font-medium sm:text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AdminCandidatePage({
  params,
}: PageProps<"/[locale]/admin/candidates/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const admin = await requireAdmin();

  if (!UUID_PATTERN.test(id)) notFound();
  const data = await getCandidateForAdmin(id);
  if (!data) notFound();
  const { user, profile, activeSessions } = data;

  const [t, tProfile, tAudit, format, audit] = await Promise.all([
    getTranslations("Admin.candidates"),
    getTranslations("Profile"),
    getTranslations("Admin.audit"),
    getFormatter(),
    listAuditLogs({ targetUserId: id, page: 1 }),
  ]);

  const empty = "—";
  const date = (value: Date | null) =>
    value
      ? format.dateTime(value, { dateStyle: "medium", timeStyle: "short" })
      : empty;
  const yesNo = (value: boolean | null | undefined) =>
    value == null ? empty : value ? tProfile("yes") : tProfile("no");
  const completion = getProfileCompletion(profile);
  const doneSteps = profileSteps.filter((step) => completion[step]).length;

  return (
    <>
      <Link
        href="/admin/candidates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="mt-4 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-medium">{user.name}</h1>
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
        {user.id !== admin.id && (
          <UserActions
            userId={user.id}
            status={user.status}
            activeSessions={activeSessions}
          />
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title={t("sections.account")}>
          <Rows
            items={[
              { label: t("fields.signedUp"), value: date(user.createdAt) },
              {
                label: t("fields.ageConfirmed"),
                value: date(user.ageConfirmedAt),
              },
              {
                label: t("fields.termsAccepted"),
                value: date(user.termsAcceptedAt),
              },
              { label: t("fields.activeSessions"), value: activeSessions },
              {
                label: t("fields.profileProgress"),
                value: t("stepsDone", {
                  done: doneSteps,
                  total: profileSteps.length,
                }),
              },
            ]}
          />
        </Card>

        <Card title={t("sections.contact")}>
          <Rows
            items={[
              {
                label: tProfile("fields.phone"),
                value: profile?.phone ? formatUsPhone(profile.phone) : empty,
              },
              {
                label: tProfile("fields.dateOfBirth"),
                value: profile?.dateOfBirth
                  ? format.dateTime(
                      new Date(`${profile.dateOfBirth}T00:00:00Z`),
                      {
                        dateStyle: "long",
                        timeZone: "UTC",
                      },
                    )
                  : empty,
              },
              {
                label: tProfile("fields.street"),
                value: profile?.street ?? empty,
              },
              {
                label: tProfile("fields.city"),
                value:
                  profile?.city && profile.state
                    ? `${profile.city}, ${profile.state} ${profile.zip ?? ""}`.trim()
                    : empty,
              },
            ]}
          />
        </Card>

        <Card title={t("sections.professional")}>
          <Rows
            items={[
              {
                label: tProfile("fields.desiredRole"),
                value: isOneOf(desiredRoles, profile?.desiredRole)
                  ? tProfile(`options.roles.${profile.desiredRole}`)
                  : empty,
              },
              {
                label: tProfile("fields.education"),
                value: isOneOf(educationLevels, profile?.education)
                  ? tProfile(`options.education.${profile.education}`)
                  : empty,
              },
              {
                label: tProfile("fields.skills"),
                value: profile?.skills?.length
                  ? profile.skills
                      .map((skill) =>
                        isSuggestedSkill(skill)
                          ? tProfile(`options.skills.${skill}`)
                          : skill,
                      )
                      .join(", ")
                  : empty,
              },
            ]}
          />
        </Card>

        <Card title={t("sections.eligibility")}>
          <Rows
            items={[
              {
                label: tProfile("fields.workAuthorized"),
                value: yesNo(profile?.workAuthorized),
              },
              {
                label: tProfile("fields.needsSponsorship"),
                value: yesNo(profile?.needsSponsorship),
              },
              {
                label: tProfile("fields.ssn"),
                value: profile?.ssnLast4 ? (
                  <RevealDocument
                    userId={user.id}
                    document="ssn"
                    masked={maskSsn(profile.ssnLast4)}
                  />
                ) : (
                  empty
                ),
              },
              {
                label: tProfile("fields.passportNumber"),
                value: profile?.passportNumberLast4 ? (
                  <RevealDocument
                    userId={user.id}
                    document="passportNumber"
                    masked={maskPassportNumber(profile.passportNumberLast4)}
                  />
                ) : (
                  empty
                ),
              },
            ]}
          />
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-medium">
          {t("sections.history")}
        </h2>
        {audit.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {audit.rows.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span>
                  <span className="font-medium">
                    <AuditActionLabel
                      action={log.action}
                      metadata={log.metadata}
                    />
                  </span>
                  <span className="text-muted-foreground">
                    {" · "}
                    {log.actorName ?? tAudit("deletedUser")}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {date(log.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
