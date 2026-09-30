import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  RESUME_MAX_BYTES,
  RESUME_CONTENT_TYPE,
  isOwnResumePathname,
} from "@/lib/resumes/options";

// Autoriza o navegador a enviar o CV direto para o Blob (o arquivo não passa
// por aqui, então não esbarra no limite de 4,5 MB das funções). Só libera
// para o candidato logado, na pasta dele, só PDF e no tamanho permitido.
// O CV só entra no perfil depois, pela action saveResume.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getCurrentUser();
        if (!user || user.role !== "candidate") throw new Error("forbidden");
        if (!isOwnResumePathname(pathname, user.id)) {
          throw new Error("invalidPathname");
        }
        return {
          allowedContentTypes: [RESUME_CONTENT_TYPE],
          maximumSizeInBytes: RESUME_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "uploadNotAllowed" }, { status: 400 });
  }
}
