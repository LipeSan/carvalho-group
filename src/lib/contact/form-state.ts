// Códigos de erro traduzidos no cliente (namespace "Contact.errors").
export type ContactErrorCode =
  | "nameRequired"
  | "nameTooLong"
  | "emailRequired"
  | "emailInvalid"
  | "phoneInvalid"
  | "messageTooShort"
  | "messageTooLong"
  | "tooManyMessages"
  | "unexpected";

export type ContactField = "name" | "email" | "phone" | "subject" | "message";

export type ContactFormState =
  | {
      values?: Partial<Record<ContactField, string>>;
      fieldErrors?: Partial<Record<ContactField, ContactErrorCode>>;
      formError?: ContactErrorCode;
      success?: boolean;
    }
  | undefined;
