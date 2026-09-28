// Códigos de erro em vez de mensagens: a tradução acontece no cliente, a
// partir de messages/*.json (namespace "Auth.errors").
export type AuthErrorCode =
  | "nameRequired"
  | "emailRequired"
  | "emailInvalid"
  | "emailTaken"
  | "passwordRequired"
  | "passwordTooShort"
  | "invalidCredentials"
  | "invalidResetToken";

export type AuthField = "name" | "email" | "password";

export type AuthFormState =
  | {
      // Valores devolvidos para repreencher o formulário (nunca a senha).
      values?: Partial<Record<Exclude<AuthField, "password">, string>>;
      fieldErrors?: Partial<Record<AuthField, AuthErrorCode>>;
      formError?: AuthErrorCode;
      success?: boolean;
    }
  | undefined;
