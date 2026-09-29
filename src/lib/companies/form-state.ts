// Tipos do formulário de empresa + conta do responsável, usado no
// autocadastro (/employers/sign-up) e na criação pelo admin. Erros são
// códigos traduzidos no cliente (namespace "EmployerSignUp.errors").

export type CompanyFormField =
  | "name"
  | "email"
  | "password"
  | "termsAccepted"
  | "companyName"
  | "ein"
  | "website"
  | "phone"
  | "city"
  | "state";

export type CompanyFormErrorCode =
  | "required"
  | "tooShort"
  | "tooLong"
  | "emailInvalid"
  | "emailTaken"
  | "passwordTooShort"
  | "termsNotAccepted"
  | "einInvalid"
  | "websiteInvalid"
  | "phoneInvalid"
  | "stateRequired";

// Valores devolvidos para repreencher o formulário (nunca a senha).
export type CompanyFormValues = Partial<
  Record<Exclude<CompanyFormField, "password" | "termsAccepted">, string>
> & { termsAccepted?: boolean };

export type CompanyFormState =
  | {
      values?: CompanyFormValues;
      fieldErrors?: Partial<Record<CompanyFormField, CompanyFormErrorCode>>;
    }
  | undefined;
