import "server-only";

type Email = {
  to: string;
  subject: string;
  text: string;
};

// TODO: integrar um provedor de email (Resend, Postmark, SES...). Até lá, em
// desenvolvimento o email é apenas impresso no terminal do `next dev`.
export async function sendEmail(email: Email): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `\n📧 Email para ${email.to}\nAssunto: ${email.subject}\n\n${email.text}\n`,
    );
    return;
  }

  console.error(
    `Nenhum provedor de email configurado; email "${email.subject}" não enviado.`,
  );
}

// URL pública usada em links de email. Não usa o header Host da requisição,
// que pode ser forjado para apontar links de redefinição para outro domínio.
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
