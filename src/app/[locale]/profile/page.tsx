import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";

import { Navbar } from "@/components/landing/navbar";
import { ProfileStepForm } from "@/components/profile/profile-step-form";
import { ResumeField } from "@/components/profile/resume-field";
import { Link, redirect } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/session";
import { dateOfBirthBounds, formatUsPhone } from "@/lib/profile/options";
import { getCandidateProfile } from "@/lib/profile/queries";
import {
  firstIncompleteStep,
  getProfileCompletion,
  isProfileStep,
  nextProfileStep,
  profileSteps,
} from "@/lib/profile/steps";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Profile" });

  return { title: t("metaTitle") };
}

export default async function ProfilePage({
  params,
  searchParams,
}: PageProps<"/[locale]/profile">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireUser();
  if (user.role !== "candidate") {
    redirect({ href: "/account", locale });
  }

  const profile = await getCandidateProfile(user.id);
  const completion = getProfileCompletion(profile);

  // Sem ?step, abre no primeiro passo ainda incompleto.
  const { step: stepParam } = await searchParams;
  const step = isProfileStep(stepParam)
    ? stepParam
    : (firstIncompleteStep(profile) ?? "contact");
  const stepIndex = profileSteps.indexOf(step);
  const next = nextProfileStep(step);

  const t = await getTranslations("Profile");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-medium sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href="/"
            className="shrink-0 pt-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("later")}
          </Link>
        </div>

        <nav aria-label={t("stepsLabel")} className="mt-8">
          <ol className="grid grid-cols-3 gap-2">
            {profileSteps.map((item, index) => {
              const current = item === step;
              const done = completion[item];
              return (
                <li key={item}>
                  <Link
                    href={{ pathname: "/profile", query: { step: item } }}
                    aria-current={current ? "step" : undefined}
                    className="group flex flex-col gap-2"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-colors ${
                        current
                          ? "bg-primary"
                          : done
                            ? "bg-primary/40"
                            : "bg-border group-hover:bg-primary/20"
                      }`}
                    />
                    <span
                      className={`flex items-center gap-1 text-xs font-medium sm:text-sm ${
                        current ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {done && <Check className="size-3.5 text-primary" />}
                      <span className="sr-only sm:not-sr-only">
                        {index + 1}.
                      </span>
                      {t(`steps.${item}`)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <p className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
            {t("stepOf", {
              current: stepIndex + 1,
              total: profileSteps.length,
            })}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-medium">
            {t(`steps.${step}`)}
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            {t(`stepDescriptions.${step}`)}
          </p>

          <ProfileStepForm
            // Remonta ao trocar de passo para limpar erros do passo anterior.
            key={step}
            step={step}
            isLastStep={next === null}
            skipHref={next ? `/profile?step=${next}` : "/account"}
            initialValues={{
              phone: profile?.phone ? formatUsPhone(profile.phone) : undefined,
              dateOfBirth: profile?.dateOfBirth ?? undefined,
              street: profile?.street ?? undefined,
              city: profile?.city ?? undefined,
              state: profile?.state ?? undefined,
              zip: profile?.zip ?? undefined,
              desiredRole: profile?.desiredRole ?? undefined,
              skills: profile?.skills ?? [],
              education: profile?.education ?? undefined,
              workAuthorized: profile?.workAuthorized,
              needsSponsorship: profile?.needsSponsorship,
            }}
            dateOfBirthBounds={dateOfBirthBounds()}
            savedDocuments={{
              ssnLast4: profile?.ssnLast4 ?? undefined,
              passportNumberLast4: profile?.passportNumberLast4 ?? undefined,
            }}
          />
        </section>

        {/* O CV é opcional e salva sozinho, fora do formulário do passo. */}
        {step === "professional" && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <h2 className="font-heading text-lg font-medium">
              {t("resume.title")}
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              {t("resume.description")}
            </p>
            <ResumeField
              userId={user.id}
              resume={
                profile?.resumePathname &&
                profile.resumeSize != null &&
                profile.resumeUploadedAt
                  ? {
                      fileName: profile.resumeFileName,
                      size: profile.resumeSize,
                      uploadedAt: profile.resumeUploadedAt,
                    }
                  : null
              }
            />
          </section>
        )}
      </main>
    </div>
  );
}
