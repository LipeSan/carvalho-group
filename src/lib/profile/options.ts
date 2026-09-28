// Vocabulário fixo do perfil do candidato. Os slugs são salvos no banco e
// traduzidos pela interface (namespace "Profile.options" em messages/*.json).

export const desiredRoles = [
  "plasterer",
  "drywallInstaller",
  "painter",
  "carpenter",
  "framer",
  "roofer",
  "constructionLaborer",
  "electricianHelper",
  "plumberHelper",
  "handyman",
  "landscaper",
  "cleaningHelper",
  "housekeeper",
  "cook",
  "dishwasher",
  "server",
  "bartender",
  "cashier",
  "attendant",
  "warehouseAssociate",
  "driver",
  "mover",
  "caregiver",
  "nanny",
  "other",
] as const;

export const suggestedSkills = [
  "drywall",
  "plastering",
  "painting",
  "tile",
  "framing",
  "roofing",
  "concrete",
  "carpentry",
  "electrical",
  "plumbing",
  "landscaping",
  "cleaning",
  "cooking",
  "customerService",
  "forklift",
  "powerTools",
  "heavyLifting",
  "driversLicense",
  "osha10",
  "englishSpeaking",
  "spanishSpeaking",
  "portugueseSpeaking",
] as const;

export const educationLevels = [
  "lessThanHighSchool",
  "highSchool",
  "someCollege",
  "associate",
  "bachelor",
  "master",
  "doctorate",
] as const;

// Estados dos EUA + DC. Nomes próprios, não traduzidos.
export const usStates = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
} as const;

export type DesiredRole = (typeof desiredRoles)[number];
export type SuggestedSkill = (typeof suggestedSkills)[number];
export type EducationLevel = (typeof educationLevels)[number];
export type UsState = keyof typeof usStates;

export const MAX_SKILLS = 20;
export const MAX_CUSTOM_SKILL_LENGTH = 40;

export function isOneOf<T extends string>(
  list: readonly T[],
  value: unknown,
): value is T {
  return (
    typeof value === "string" && (list as readonly string[]).includes(value)
  );
}

export function isUsState(value: unknown): value is UsState {
  return typeof value === "string" && Object.hasOwn(usStates, value);
}

export function isSuggestedSkill(value: string): value is SuggestedSkill {
  return isOneOf(suggestedSkills, value);
}

// Aceita (407) 555-1234, 407-555-1234, +1 407 555 1234 etc. e devolve E.164.
export function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  // Código de área e prefixo não começam com 0 ou 1 no plano de numeração.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return `+1${national}`;
}

export function formatUsPhone(e164: string): string {
  const n = e164.replace(/^\+1/, "");
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

export const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

const MIN_AGE = 18;
const MAX_AGE = 100;

// Datas no formato do <input type="date"> (AAAA-MM-DD). Comparar essas
// strings equivale a comparar as datas.
function isoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Limites aceitos para a data de nascimento: de 100 anos atrás até hoje
// menos 18 anos (a mesma idade mínima confirmada no cadastro).
export function dateOfBirthBounds(today = new Date()): {
  min: string;
  max: string;
} {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();
  return {
    min: isoDate(year - MAX_AGE, month, day),
    max: isoDate(year - MIN_AGE, month, day),
  };
}

export function validateDateOfBirth(
  value: string,
  today = new Date(),
): "invalid" | "tooYoung" | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "invalid";
  // Recusa datas que não existem, como 2001-02-30.
  const [, y, m, d] = match.map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== d) {
    return "invalid";
  }
  const { min, max } = dateOfBirthBounds(today);
  if (value > max) return "tooYoung";
  if (value < min) return "invalid";
  return null;
}

// SSN: aceita com ou sem traços e devolve só os 9 dígitos. Segue as regras
// da Social Security: área não pode ser 000, 666 nem 900–999; grupo não pode
// ser 00; série não pode ser 0000.
export function normalizeSsn(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "");
  if (!/^\d{9}$/.test(digits)) return null;
  const area = digits.slice(0, 3);
  const group = digits.slice(3, 5);
  const serial = digits.slice(5);
  if (area === "000" || area === "666" || area.startsWith("9")) return null;
  if (group === "00" || serial === "0000") return null;
  return digits;
}

// Passaporte de qualquer país: letras e números, sem espaços ou traços. O
// tamanho varia por país (EUA: 9); aceitamos de 5 a 20.
export function normalizePassportNumber(input: string): string | null {
  const value = input.replace(/[\s-]/g, "").toUpperCase();
  return /^[A-Z0-9]{5,20}$/.test(value) ? value : null;
}

export function maskSsn(last4: string): string {
  return `•••-••-${last4}`;
}

export function maskPassportNumber(last4: string): string {
  return `•••••${last4}`;
}
