import type { SafeCandidateProfile } from "./queries";

// Passos do onboarding do perfil, na ordem em que aparecem.
export const profileSteps = ["contact", "professional", "eligibility"] as const;

export type ProfileStep = (typeof profileSteps)[number];

export function isProfileStep(value: unknown): value is ProfileStep {
  return (
    typeof value === "string" &&
    (profileSteps as readonly string[]).includes(value)
  );
}

export function nextProfileStep(step: ProfileStep): ProfileStep | null {
  return profileSteps[profileSteps.indexOf(step) + 1] ?? null;
}

// Um passo está completo quando todos os campos obrigatórios dele foram
// preenchidos (rua e skills são opcionais).
export function getProfileCompletion(
  profile: SafeCandidateProfile | null,
): Record<ProfileStep, boolean> {
  return {
    contact: Boolean(
      profile?.phone && profile.city && profile.state && profile.zip,
    ),
    professional: Boolean(profile?.desiredRole && profile.education),
    eligibility:
      profile?.workAuthorized != null && profile.needsSponsorship != null,
  };
}

export function firstIncompleteStep(
  profile: SafeCandidateProfile | null,
): ProfileStep | null {
  const completion = getProfileCompletion(profile);
  return profileSteps.find((step) => !completion[step]) ?? null;
}
