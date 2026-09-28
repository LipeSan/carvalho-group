// Códigos de erro em vez de mensagens: a tradução acontece no cliente, a
// partir de messages/*.json (namespace "Auth.errors").
export type AuthErrorCode =
  | "nameRequired"
  | "emailRequired"
  | "emailInvalid"
  | "emailTaken"
  | "passwordRequired"
  | "passwordTooShort"
  | "ageNotConfirmed"
  | "termsNotAccepted"
  | "invalidCredentials"
  | "invalidResetToken";

export type AuthField =
  "name" | "email" | "password" | "ageConfirmed" | "termsAccepted";

export type AuthFormState =
  | {
      // Valores devolvidos para repreencher o formulário (nunca a senha).
      values?: {
        name?: string;
        email?: string;
        ageConfirmed?: boolean;
        termsAccepted?: boolean;
      };
      fieldErrors?: Partial<Record<AuthField, AuthErrorCode>>;
      formError?: AuthErrorCode;
      success?: boolean;
    }
  | undefined;
