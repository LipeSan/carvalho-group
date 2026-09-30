"use server";

import { refresh } from "next/cache";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createApplication } from "@/lib/applications/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublishedJob } from "@/lib/jobs/queries";
import { getCandidateProfile } from "@/lib/profile/queries";
import { firstIncompleteStep } from "@/lib/profile/steps";

// Repete as regras do botão da página: a action pode ser chamada direto.
export async function applyToJob(jobId: number): Promise<void> {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) {
    redirect({
      href: { pathname: "/sign-in", query: { next: `/jobs/${jobId}` } },
      locale,
    });
    return;
  }
  if (user.role !== "candidate") return;

  if (firstIncompleteStep(await getCandidateProfile(user.id)) !== null) {
    redirect({ href: "/profile", locale });
    return;
  }

  // Só vagas visíveis no site (publicadas e de empresa aprovada).
  if (!Number.isInteger(jobId) || !(await getPublishedJob(jobId))) return;

  await createApplication(jobId, user.id);
  refresh();
}
