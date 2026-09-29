// Tipos do formulário de vaga do admin, compartilhados entre o formulário
// (cliente) e a action (servidor). Erros são códigos traduzidos no cliente
// (namespace "JobForm.errors").

export type JobFormField =
  | "title"
  | "category"
  | "contractType"
  | "workMode"
  | "city"
  | "state"
  | "payMin"
  | "payMax"
  | "payPeriod"
  | "payNote"
  | "description"
  | "responsibilities"
  | "requirements"
  | "benefits"
  | "schedule"
  | "status";

export type JobFormErrorCode =
  | "required"
  | "tooShort"
  | "tooLong"
  | "invalidOption"
  | "invalidAmount"
  | "minAboveMax"
  | "tooManyItems"
  | "itemTooLong"
  // Empresa ainda não aprovada tentando publicar.
  | "notAllowed";

// Valores como texto, do jeito que estão nos campos (para repreencher).
export type JobFormValues = Partial<Record<JobFormField, string>>;

export type JobFormState =
  | {
      values?: JobFormValues;
      fieldErrors?: Partial<Record<JobFormField, JobFormErrorCode>>;
    }
  | undefined;

export const JOB_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  cityMax: 100,
  payNoteMax: 40,
  descriptionMin: 20,
  descriptionMax: 5000,
  listItems: 20,
  listItemMax: 200,
  scheduleMax: 120,
  payMax: 1_000_000,
} as const;

// Listas (responsabilidades etc.) são digitadas uma por linha.
export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}
