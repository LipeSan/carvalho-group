// Contato público da Carvalho Consulting Group (página de contato, home,
// serviços e página para empresas). Deixe null o que não existir: o canal
// some do site. Telefones em E.164 (+1XXXXXXXXXX).
export const siteContact: {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
} = {
  email: null,
  phone: "+17746416948",
  whatsapp: "+17746416948",
};

// Link para abrir uma conversa no WhatsApp (wa.me usa só os dígitos).
export function whatsappHref(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}

// Prazo prometido para a análise do cadastro de empresas. Se mudar, mude
// também o processo do time que aprova (admin > Empresas).
export const COMPANY_APPROVAL_BUSINESS_DAYS = 1;

// Há ao menos um canal direto (telefone, WhatsApp ou email) para mostrar.
export const hasSiteContact = Boolean(
  siteContact.email || siteContact.phone || siteContact.whatsapp,
);
