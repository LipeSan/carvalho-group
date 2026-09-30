import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { candidateProfiles } from "@/db/schema";
import { logAudit } from "@/lib/admin/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { RESUME_CONTENT_TYPE, isPdfFileName } from "@/lib/resumes/options";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// CV do candidato. Só o próprio candidato e admins; o acesso feito por admin
// fica na auditoria. Com ?view=1 o PDF abre no leitor do navegador (os links
// do admin abrem assim, numa aba nova); sem, vai como anexo. O tipo é fixo, nunca o que o navegador
// informou no envio.
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/resumes/[userId]">,
) {
  const { userId } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  const isOwner = user.id === userId;
  if (!isOwner && user.role !== "admin") {
    return new Response(null, { status: 403 });
  }
  if (!UUID_PATTERN.test(userId)) return new Response(null, { status: 404 });

  const [profile] = await db
    .select({
      pathname: candidateProfiles.resumePathname,
      fileName: candidateProfiles.resumeFileName,
    })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);
  if (!profile?.pathname || !isPdfFileName(profile.pathname)) {
    return new Response(null, { status: 404 });
  }

  const file = await get(profile.pathname, { access: "private" });
  if (!file || file.statusCode !== 200) {
    return new Response(null, { status: 404 });
  }

  const inline = new URL(request.url).searchParams.get("view") === "1";

  if (!isOwner) {
    await logAudit({
      actorId: user.id,
      action: inline ? "resume.view" : "resume.download",
      targetUserId: userId,
    });
  }

  const fileName = profile.fileName ?? "resume.pdf";
  return new Response(file.stream, {
    headers: {
      "Content-Type": RESUME_CONTENT_TYPE,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      // Abre sozinho numa aba, nunca embutido em outra página.
      "Content-Security-Policy": "frame-ancestors 'none'",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
