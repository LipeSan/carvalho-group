import type { Locale } from "@/i18n/routing";

import { privacyEn } from "./privacy.en";
import { privacyEs } from "./privacy.es";
import { privacyPt } from "./privacy.pt";
import { termsEn } from "./terms.en";
import { termsEs } from "./terms.es";
import { termsPt } from "./terms.pt";
import type { LegalDocument } from "./types";

export const termsOfUse: Record<Locale, LegalDocument> = {
  en: termsEn,
  pt: termsPt,
  es: termsEs,
};

export const privacyPolicy: Record<Locale, LegalDocument> = {
  en: privacyEn,
  pt: privacyPt,
  es: privacyEs,
};
