import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { LogOut, UserRoundPen } from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import {
  desiredRoles,
  educationLevels,
  formatUsPhone,
  isOneOf,
  isSuggestedSkill,
  maskPassportNumber,
  maskSsn,
} from "@/lib/profile/options";
import { getCandidateProfile } from "@/lib/profile/queries";
import { getProfileCompletion, profileSteps } from "@/lib/profile/steps";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/account">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });

  return { title: t("metaTitle") };
}

function DetailList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <dt className="shrink-0 text-sm text-muted-foreground">
            {item.label}
          </dt>
          <dd className="font-medium sm:text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AccountPage({
  params,
}: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  const t = await getTranslations("Account");
  const tProfile = await getTranslations("Profile");
  const format = await getFormatter();

  const details = [
    { label: t("name"), value: user.name },
    { label: t("email"), value: user.email },
    { label: t("accountType"), value: t(`roles.${user.role}`) },
  ];

  const isCandidate = user.role === "candidate";
  const profile = isCandidate ? await getCandidateProfile(user.id) : null;
  const completion = getProfileCompletion(profile);
  const completedSteps = profileSteps.filter((step) => completion[step]).length;
  const empty = "—";
  const yesNo = (value: boolean | null | undefined) =>
    value == null ? empty : value ? tProfile("yes") : tProfile("no");

  const profileDetails = profile
    ? [
        {
          label: tProfile("fields.phone"),
          value: profile.phone ? formatUsPhone(profile.phone) : empty,
        },
        {
          label: tProfile("fields.dateOfBirth"),
          // Data sem horário: formata em UTC para não "voltar um dia" em
          // fusos negativos como os dos EUA.
          value: profile.dateOfBirth
            ? format.dateTime(new Date(`${profile.dateOfBirth}T00:00:00Z`), {
                dateStyle: "long",
                timeZone: "UTC",
              })
            : empty,
        },
        {
          label: t("location"),
          value:
            [profile.street, profile.city, profile.state]
              .filter(Boolean)
              .join(", ") + (profile.zip ? ` ${profile.zip}` : "") || empty,
        },
        {
          label: tProfile("fields.desiredRole"),
          value: isOneOf(desiredRoles, profile.desiredRole)
            ? tProfile(`options.roles.${profile.desiredRole}`)
            : empty,
        },
        {
          label: tProfile("fields.skills"),
          value: profile.skills?.length
            ? profile.skills
                .map((skill) =>
                  isSuggestedSkill(skill)
                    ? tProfile(`options.skills.${skill}`)
                    : skill,
                )
                .join(", ")
            : empty,
        },
        {
          label: tProfile("fields.education"),
          value: isOneOf(educationLevels, profile.education)
            ? tProfile(`options.education.${profile.education}`)
            : empty,
        },
        {
          label: tProfile("fields.workAuthorized"),
          value: yesNo(profile.workAuthorized),
        },
        {
          label: tProfile("fields.needsSponsorship"),
          value: yesNo(profile.needsSponsorship),
        },
        {
          label: tProfile("fields.ssn"),
          value: profile.ssnLast4 ? maskSsn(profile.ssnLast4) : empty,
        },
        {
          label: tProfile("fields.passportNumber"),
          value: profile.passportNumberLast4
            ? maskPassportNumber(profile.passportNumberLast4)
            : empty,
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">
          {t("title", { name: user.name.split(" ")[0] })}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-10">
          <DetailList items={details} />
        </div>

        {isCandidate && (
          <section className="mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-medium">
                  {t("profileTitle")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("profileProgress", {
                    done: completedSteps,
                    total: profileSteps.length,
                  })}
                </p>
              </div>
              <Button
                variant={
                  completedSteps === profileSteps.length ? "outline" : "default"
                }
                size="lg"
                render={<Link href="/profile" />}
              >
                <UserRoundPen />
                {completedSteps === profileSteps.length
                  ? t("editProfile")
                  : t("completeProfile")}
              </Button>
            </div>
            {profile && (
              <div className="mt-5">
                <DetailList items={profileDetails} />
              </div>
            )}
          </section>
        )}

        <form action={logout} className="mt-12">
          <Button type="submit" variant="outline" size="lg">
            <LogOut />
            {t("signOut")}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
