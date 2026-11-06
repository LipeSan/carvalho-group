"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { after } from "next/server";
import { getLocale } from "next-intl/server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { normalizeEmail } from "@/lib/auth/password";
import { EMAIL_PATTERN } from "@/lib/auth/validation";
import type {
  ContactErrorCode,
  ContactField,
  ContactFormState,
} from "@/lib/contact/form-state";
import {
  CONTACT_LIMITS,
  contactSubjects,
  type ContactSubject,
} from "@/lib/contact/options";
import { getAppUrl, sendEmail } from "@/lib/email";
import { isOneOf, normalizeUsPhone } from "@/lib/profile/options";
import { siteContact } from "@/lib/site";

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const values = {
    name: field("name"),
    email: field("email"),
    phone: field("phone"),
    subject: field("subject"),
    message: field("message"),
  };

  // Campo escondido que só robôs preenchem: finge sucesso e descarta.
  if (field("website")) return { success: true };

  const errors: Partial<Record<ContactField, ContactErrorCode>> = {};
  if (!values.name) errors.name = "nameRequired";
  else if (values.name.length > CONTACT_LIMITS.name)
    errors.name = "nameTooLong";

  if (!values.email) errors.email = "emailRequired";
  else if (
    values.email.length > CONTACT_LIMITS.email ||
    !EMAIL_PATTERN.test(values.email)
  ) {
    errors.email = "emailInvalid";
  }

  // Telefone é opcional. Número dos EUA vira E.164; os de outros países
  // (ex.: Brasil) ficam como digitados, desde que pareçam um telefone.
  let phone: string | null = null;
  if (values.phone) {
    const digits = values.phone.replace(/\D/g, "");
    if (
      values.phone.length > CONTACT_LIMITS.phone ||
      digits.length < 8 ||
      !/^[\d\s()+.-]+$/.test(values.phone)
    ) {
      errors.phone = "phoneInvalid";
    } else {
      phone = normalizeUsPhone(values.phone) ?? values.phone;
    }
  }

  if (values.message.length < CONTACT_LIMITS.messageMin) {
    errors.message = "messageTooShort";
  } else if (values.message.length > CONTACT_LIMITS.messageMax) {
    errors.message = "messageTooLong";
  }

  if (Object.keys(errors).length > 0) return { values, fieldErrors: errors };

  const subject: ContactSubject = isOneOf(contactSubjects, values.subject)
    ? values.subject
    : "other";
  const email = normalizeEmail(values.email);

  // Limite simples contra spam: poucas mensagens por email a cada hora.
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(contactMessages)
    .where(
      and(
        eq(contactMessages.email, email),
        gt(contactMessages.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
      ),
    );
  if (recent >= CONTACT_LIMITS.perEmailPerHour) {
    return { values, formError: "tooManyMessages" };
  }

  const locale = await getLocale();
  try {
    await db.insert(contactMessages).values({
      name: values.name,
      email,
      phone,
      subject,
      message: values.message,
      locale,
    });
  } catch (error) {
    console.error("Falha ao salvar mensagem de contato", error);
    return { values, formError: "unexpected" };
  }

  // Aviso para a equipe, depois da resposta. Sem provedor de email
  // configurado, sendEmail só registra no log (ver lib/email.ts).
  const inbox = siteContact.email;
  if (inbox) {
    after(() =>
      sendEmail({
        to: inbox,
        subject: `Nova mensagem pelo site: ${values.name}`,
        text: [
          `Nome: ${values.name}`,
          `Email: ${email}`,
          `Telefone: ${phone ?? "-"}`,
          `Assunto: ${subject}`,
          `Idioma: ${locale}`,
          "",
          values.message,
          "",
          `Ver no admin: ${getAppUrl()}/${locale}/admin/messages`,
        ].join("\n"),
      }),
    );
  }

  return { success: true };
}
