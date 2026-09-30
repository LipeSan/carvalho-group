// Regras do currículo (CV), usadas no navegador e no servidor. O arquivo fica
// num store privado do Vercel Blob, em resumes/{userId}/, e só sai pela rota
// /api/resumes/[userId], que confere quem está pedindo.
//
// Só PDF: é o formato que o navegador exibe, então o admin vê o CV sem baixar.

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_MAX_FILE_NAME = 150;

export const RESUME_CONTENT_TYPE = "application/pdf";
export const RESUME_ACCEPT = ".pdf,application/pdf";

export function isPdfFileName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

// Caminho pedido pelo navegador. O Blob acrescenta um sufixo aleatório, então
// o arquivo salvo fica em resumes/{userId}/resume-XXXX.pdf.
export function resumeUploadPathname(userId: string) {
  return `resumes/${userId}/resume.pdf`;
}

export function isOwnResumePathname(pathname: string, userId: string) {
  return (
    pathname.startsWith(`resumes/${userId}/`) &&
    isPdfFileName(pathname) &&
    !pathname.includes("..")
  );
}
