// Etapas de uma candidatura. new: acabou de chegar. reviewing: em análise.
// rejected: não seguiu no processo. hired: contratada.
export const applicationStatuses = [
  "new",
  "reviewing",
  "rejected",
  "hired",
] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];
