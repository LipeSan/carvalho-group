// Sem "server-only": também é importado pelo proxy.
export const SESSION_COOKIE = "session";

// Rotas (sem o prefixo de idioma) que exigem login. O proxy só confere se o
// cookie existe; a validação real da sessão é feita na página com requireUser().
export const PROTECTED_PATHS = [
  "/account",
  "/profile",
  "/employers/dashboard",
  "/employers/jobs",
];

export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

// Página inicial de cada tipo de conta (após o login sem "next", ou ao abrir
// login/cadastro já logado).
export const HOME_BY_ROLE = {
  candidate: "/",
  employer: "/employers/dashboard",
  admin: "/admin",
} as const;
