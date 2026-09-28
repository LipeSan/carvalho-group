import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";

import { SESSION_COOKIE, isProtectedPath } from "./lib/auth/constants";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [, locale, ...rest] = pathname.split("/");
  const path = `/${rest.join("/")}`;

  // Checagem otimista: sem cookie de sessão nem chega a renderizar a página.
  // O "next" vai sem o prefixo de idioma para o login redirecionar de volta
  // no idioma atual.
  if (
    hasLocale(routing.locales, locale) &&
    isProtectedPath(path) &&
    !request.cookies.has(SESSION_COOKIE)
  ) {
    const loginUrl = new URL(`/${locale}/entrar`, request.url);
    loginUrl.searchParams.set("next", `${path}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
