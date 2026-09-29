// Status de uma empresa na plataforma. pending: aguardando análise do admin.
// approved: pode operar (publicar vagas, no futuro). rejected: recusada, com
// o motivo registrado.
export const companyStatuses = ["pending", "approved", "rejected"] as const;
export type CompanyStatus = (typeof companyStatuses)[number];

// Papel da pessoa dentro da empresa. Hoje só existe o dono (quem cadastrou);
// recrutadores convidados virão depois.
export const companyMemberRoles = ["owner", "recruiter"] as const;
export type CompanyMemberRole = (typeof companyMemberRoles)[number];

export const COMPANY_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  websiteMax: 200,
  cityMax: 100,
  rejectionReasonMax: 500,
} as const;

// EIN (Employer Identification Number): 9 dígitos, exibido como 12-3456789.
// Aceita com ou sem traço e devolve normalizado, ou null se inválido.
export function normalizeEin(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "");
  if (!/^\d{9}$/.test(digits)) return null;
  // Prefixos 00, 07-09, 17-19, 28-29, 49, 69-70, 78-79 e 89 nunca foram
  // atribuídos pelo IRS; os demais são aceitos.
  const invalidPrefixes = [
    "00",
    "07",
    "08",
    "09",
    "17",
    "18",
    "19",
    "28",
    "29",
    "49",
    "69",
    "70",
    "78",
    "79",
    "89",
  ];
  if (invalidPrefixes.includes(digits.slice(0, 2))) return null;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

// Site: aceita "acme.com" ou "https://acme.com" e devolve a URL completa.
export function normalizeWebsite(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    if (!url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
