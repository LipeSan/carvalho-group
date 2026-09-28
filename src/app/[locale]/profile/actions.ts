"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/session";
import { encryptPii } from "@/lib/crypto/pii";
import type {
  ProfileField,
  ProfileErrorCode,
  ProfileFormState,
  ProfileFormValues,
} from "@/lib/profile/form-state";
import {
  MAX_CUSTOM_SKILL_LENGTH,
  MAX_SKILLS,
  ZIP_PATTERN,
  desiredRoles,
  educationLevels,
  isOneOf,
  isUsState,
  normalizePassportNumber,
  normalizeSsn,
  normalizeUsPhone,
  validateDateOfBirth,
} from "@/lib/profile/options";
import { saveCandidateProfile } from "@/lib/profile/queries";
import { isProfileStep, nextProfileStep } from "@/lib/profile/steps";

type FieldErrors = Partial<Record<ProfileField, ProfileErrorCode>>;

const MAX_STREET_LENGTH = 200;
const MAX_CITY_LENGTH = 100;

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function yesNo(formData: FormData, name: string): boolean | null {
  const value = formData.get(name);
  return value === "yes" ? true : value === "no" ? false : null;
}

export async function saveProfileStep(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  const locale = await getLocale();

  if (user.role !== "candidate") {
    redirect({ href: "/account", locale });
  }

  const step = formData.get("step");
  if (!isProfileStep(step)) {
    redirect({ href: "/profile", locale });
    return;
  }

  const fieldErrors: FieldErrors = {};
  let values: ProfileFormValues;

  if (step === "contact") {
    const phoneInput = text(formData, "phone");
    const street = text(formData, "street");
    const city = text(formData, "city");
    const state = text(formData, "state");
    const zip = text(formData, "zip");
    const dateOfBirth = text(formData, "dateOfBirth");
    values = { phone: phoneInput, dateOfBirth, street, city, state, zip };

    const phone = normalizeUsPhone(phoneInput);
    if (!phoneInput) fieldErrors.phone = "phoneRequired";
    else if (!phone) fieldErrors.phone = "phoneInvalid";
    // Opcional: só valida se foi preenchida.
    const dateOfBirthError = dateOfBirth && validateDateOfBirth(dateOfBirth);
    if (dateOfBirthError === "invalid") {
      fieldErrors.dateOfBirth = "dateOfBirthInvalid";
    } else if (dateOfBirthError === "tooYoung") {
      fieldErrors.dateOfBirth = "dateOfBirthTooYoung";
    }
    if (street.length > MAX_STREET_LENGTH) fieldErrors.street = "streetTooLong";
    if (!city || city.length > MAX_CITY_LENGTH)
      fieldErrors.city = "cityRequired";
    if (!isUsState(state)) fieldErrors.state = "stateRequired";
    if (!zip) fieldErrors.zip = "zipRequired";
    else if (!ZIP_PATTERN.test(zip)) fieldErrors.zip = "zipInvalid";

    if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

    await saveCandidateProfile(user.id, {
      phone,
      dateOfBirth: dateOfBirth || null,
      street: street || null,
      city,
      state,
      zip,
    });
  } else if (step === "professional") {
    const desiredRole = text(formData, "desiredRole");
    const education = text(formData, "education");
    // Remove vazios e duplicados (sem diferenciar maiúsculas).
    const seen = new Set<string>();
    const skills = formData
      .getAll("skills")
      .map((skill) => String(skill).trim())
      .filter((skill) => {
        const key = skill.toLowerCase();
        if (!skill || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    values = { desiredRole, education, skills };

    if (!isOneOf(desiredRoles, desiredRole)) {
      fieldErrors.desiredRole = "desiredRoleRequired";
    }
    if (!isOneOf(educationLevels, education)) {
      fieldErrors.education = "educationRequired";
    }
    if (skills.length > MAX_SKILLS) fieldErrors.skills = "skillsTooMany";
    else if (skills.some((skill) => skill.length > MAX_CUSTOM_SKILL_LENGTH)) {
      fieldErrors.skills = "skillTooLong";
    }

    if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

    await saveCandidateProfile(user.id, { desiredRole, education, skills });
  } else {
    const workAuthorized = yesNo(formData, "workAuthorized");
    const needsSponsorship = yesNo(formData, "needsSponsorship");
    // SSN e passaporte são opcionais. Campo vazio mantém o valor já salvo.
    const ssnInput = text(formData, "ssn");
    const passportInput = text(formData, "passportNumber");
    const ssn = ssnInput ? normalizeSsn(ssnInput) : null;
    const passportNumber = passportInput
      ? normalizePassportNumber(passportInput)
      : null;
    values = { workAuthorized, needsSponsorship };

    if (workAuthorized === null) {
      fieldErrors.workAuthorized = "workAuthorizedRequired";
    }
    if (needsSponsorship === null) {
      fieldErrors.needsSponsorship = "needsSponsorshipRequired";
    }
    if (ssnInput && !ssn) fieldErrors.ssn = "ssnInvalid";
    if (passportInput && !passportNumber) {
      fieldErrors.passportNumber = "passportNumberInvalid";
    }

    if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

    await saveCandidateProfile(user.id, {
      workAuthorized,
      needsSponsorship,
      ...(ssn && {
        ssnEncrypted: encryptPii(ssn),
        ssnLast4: ssn.slice(-4),
      }),
      ...(passportNumber && {
        passportNumberEncrypted: encryptPii(passportNumber),
        passportNumberLast4: passportNumber.slice(-4),
      }),
    });
  }

  const next = nextProfileStep(step);
  redirect({
    href: next ? { pathname: "/profile", query: { step: next } } : "/account",
    locale,
  });
}
