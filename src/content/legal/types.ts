// Estrutura dos documentos legais (termos, privacidade). O conteúdo é longo
// demais para messages/*.json, então fica em arquivos próprios por idioma.

// Um bloco do corpo: parágrafo (string) ou lista de itens (string[]).
export type LegalBlock = string | string[];

export type LegalSection = {
  // Âncora estável, igual em todos os idiomas (ex.: #eligibility).
  id: string;
  title: string;
  body: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  // Data da última atualização no formato AAAA-MM-DD.
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
};
