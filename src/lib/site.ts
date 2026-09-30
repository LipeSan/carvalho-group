// Contato público da Carvalho Group, mostrado na página para empresas.
// Deixe null o que não existir: a seção de contato só aparece com ao menos
// um canal preenchido. Telefone em E.164 (+1XXXXXXXXXX).
export const siteContact: {
  email: string | null;
  phone: string | null;
} = {
  email: null,
  phone: null,
};

// Prazo prometido para a análise do cadastro de empresas. Se mudar, mude
// também o processo do time que aprova (admin > Empresas).
export const COMPANY_APPROVAL_BUSINESS_DAYS = 1;
