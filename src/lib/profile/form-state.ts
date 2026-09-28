// Códigos de erro traduzidos no cliente (namespace "Profile.errors").
export type ProfileErrorCode =
  | "phoneRequired"
  | "phoneInvalid"
  | "dateOfBirthInvalid"
  | "dateOfBirthTooYoung"
  | "streetTooLong"
  | "cityRequired"
  | "stateRequired"
  | "zipRequired"
  | "zipInvalid"
  | "desiredRoleRequired"
  | "educationRequired"
  | "skillsTooMany"
  | "skillTooLong"
  | "workAuthorizedRequired"
  | "needsSponsorshipRequired"
  | "ssnInvalid"
  | "passportNumberInvalid";

export type ProfileField =
  | "phone"
  | "dateOfBirth"
  | "street"
  | "city"
  | "state"
  | "zip"
  | "desiredRole"
  | "skills"
  | "education"
  | "workAuthorized"
  | "needsSponsorship"
  | "ssn"
  | "passportNumber";

// Valores enviados, devolvidos para repreencher o formulário após um erro.
// SSN e passaporte ficam de fora de propósito: nunca voltam ao navegador.
export type ProfileFormValues = {
  phone?: string;
  dateOfBirth?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  desiredRole?: string;
  skills?: string[];
  education?: string;
  workAuthorized?: boolean | null;
  needsSponsorship?: boolean | null;
};

export type ProfileFormState =
  | {
      values?: ProfileFormValues;
      fieldErrors?: Partial<Record<ProfileField, ProfileErrorCode>>;
    }
  | undefined;
