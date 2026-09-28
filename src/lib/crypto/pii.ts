import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Criptografia de dados pessoais sensíveis (SSN, passaporte) antes de irem ao
// banco. A chave fica só em variável de ambiente, fora do banco: um vazamento
// do banco sozinho não expõe os documentos.
//
// ⚠️ Se a PII_ENCRYPTION_KEY for perdida, os dados criptografados com ela não
// podem ser recuperados. Guarde uma cópia num cofre de senhas.
//
// Formato salvo: "v1:" + base64(iv[12] + authTag[16] + ciphertext). A versão
// permite trocar de chave no futuro sem invalidar o que já está salvo.

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const encoded = process.env.PII_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error(
      "PII_ENCRYPTION_KEY não configurada. Gere com: openssl rand -base64 32",
    );
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("PII_ENCRYPTION_KEY precisa ter 32 bytes em base64.");
  }
  return key;
}

export function encryptPii(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
  return `${VERSION}:${payload.toString("base64")}`;
}

// Só para fluxos internos que realmente precisem do valor (ex.: contratação).
// Nunca envie o resultado para o navegador.
export function decryptPii(stored: string): string {
  const [version, data] = stored.split(":");
  if (version !== VERSION || !data) {
    throw new Error("Formato de dado criptografado desconhecido.");
  }
  const payload = Buffer.from(data, "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}
