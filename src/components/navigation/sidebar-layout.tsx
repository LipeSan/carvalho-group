import { Navbar } from "@/components/landing/navbar";

// Estrutura das áreas logadas (admin e empresa): navbar do site, menu
// lateral fixo na rolagem e conteúdo. No celular o menu fica acima.
export function SidebarLayout({
  header,
  nav,
  children,
}: {
  // Topo do menu lateral (ex.: "Administração", nome da empresa).
  header: React.ReactNode;
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  // minmax(0,1fr): sem isso, a faixa de menu rolável do celular alarga a
  // coluna e a página inteira ganha rolagem horizontal.
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-[minmax(0,1fr)] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-3 px-3">{header}</div>
          {nav}
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
