import type { LegalDocument } from "./types";

// Tradução de conveniência; a versão em inglês é a oficial.
// Itens [entre colchetes] precisam ser preenchidos antes de publicar.
export const privacyPt: LegalDocument = {
  title: "Política de Privacidade",
  updatedAt: "2026-09-29",
  intro: [
    'Esta Política de Privacidade explica como [Razão social da empresa] ("Carvalho Group", "nós" ou "nosso") coleta, usa, compartilha e protege dados pessoais quando você usa a Carvalho Group Jobs (a "Plataforma").',
    "Ela vale para Candidatos, Empresas e visitantes. Ao usar a Plataforma, você reconhece esta Política, que faz parte dos nossos Termos de Uso.",
  ],
  sections: [
    {
      id: "collect",
      title: "1. Dados que coletamos",
      body: [
        "Dados que você nos fornece:",
        [
          "Dados da conta: nome, email e senha (guardada apenas como hash seguro, nunca em texto), além da confirmação de que você tem 18 anos ou mais e do aceite dos Termos.",
          "Perfil do Candidato: telefone, data de nascimento (opcional), endereço (opcional), cidade, estado e ZIP code, função desejada, habilidades, escolaridade e se você tem autorização para trabalhar nos Estados Unidos e precisa de patrocínio de visto.",
          "Documentos de identificação (opcionais): Social Security Number (SSN) e número do passaporte, se você decidir informá-los.",
          "Dados da Empresa: nome da empresa, EIN (opcional), site (opcional), telefone, cidade e estado, dados de contato do responsável pela conta e as vagas que publica.",
        ],
        "Dados coletados automaticamente:",
        [
          "Um cookie de sessão que mantém você conectado. Não usamos cookies de publicidade nem de análise (analytics).",
          "Dados técnicos processados pelo nosso provedor de hospedagem para entregar e proteger a Plataforma, como endereço IP, tipo de navegador e registros de acesso.",
          "Nas ações feitas pela nossa equipe na área administrativa, a data, a hora e o endereço IP de cada ação, guardados em um registro de auditoria.",
        ],
      ],
    },
    {
      id: "sensitive",
      title: "2. Dados sensíveis",
      body: [
        "Alguns dados, como SSN, número do passaporte e data de nascimento, são considerados dados pessoais sensíveis por certas leis estaduais. Informá-los é sempre opcional.",
        "SSN e número do passaporte são criptografados antes de serem guardados, nunca são mostrados às Empresas na Plataforma e aparecem apenas de forma mascarada (por exemplo, •••-••-1234). Só funcionários autorizados da Carvalho Group podem revelar o número completo, quando necessário para contratação ou admissão, e toda revelação fica registrada na auditoria.",
        "Sua data de nascimento nunca é mostrada às Empresas. Usamos dados sensíveis apenas para as finalidades descritas nesta Política e não os usamos para inferir características sobre você.",
      ],
    },
    {
      id: "use",
      title: "3. Como usamos os dados",
      body: [
        [
          "Para criar e gerenciar contas e manter você conectado.",
          "Para exibir vagas e permitir que Candidatos montem o perfil e se candidatem.",
          "Para compartilhar o perfil de Candidatos com Empresas durante um processo seletivo.",
          "Para analisar e aprovar contas de Empresa e evitar vagas fraudulentas.",
          "Para enviar mensagens do serviço, como emails de redefinição de senha.",
          "Para proteger a Plataforma, evitar abusos e cumprir obrigações legais.",
          "Para melhorar a Plataforma.",
        ],
        "Não vendemos seus dados pessoais e não os usamos para publicidade direcionada.",
      ],
    },
    {
      id: "share",
      title: "4. Com quem compartilhamos",
      body: [
        [
          "Com Empresas: quando você se candidata ou participa de um processo seletivo, a Empresa pode ver as informações do seu perfil, exceto SSN, número do passaporte e data de nascimento.",
          "Com prestadores de serviço que nos ajudam a operar a Plataforma, sob contratos que limitam o uso dos dados (veja a seção 5).",
          "Quando exigido por lei, ou para proteger os direitos, a segurança e o patrimônio dos usuários, da Carvalho Group ou do público.",
          "Em caso de fusão, aquisição ou venda de ativos, sujeito a esta Política.",
        ],
        "O nome das Empresas é mantido em sigilo nas vagas públicas.",
      ],
    },
    {
      id: "providers",
      title: "5. Prestadores de serviço",
      body: [
        "Atualmente usamos:",
        [
          "Vercel, para hospedar a Plataforma;",
          "Neon, para guardar o nosso banco de dados;",
          "Google Maps Platform, para sugerir endereços e cidades enquanto você digita — o texto digitado nesses campos é enviado ao Google para gerar as sugestões;",
          "[Provedor de email], para enviar emails do serviço.",
        ],
        "Esses prestadores tratam dados em nosso nome e podem estar localizados nos Estados Unidos.",
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies",
      body: [
        "Usamos um único cookie essencial para manter você conectado. Ele é necessário para a Plataforma funcionar e não pode ser desativado enquanto você estiver conectado. Também podemos guardar pequenas preferências no seu navegador. Não usamos cookies de publicidade nem de análise de terceiros.",
      ],
    },
    {
      id: "security",
      title: "7. Segurança",
      body: [
        "Adotamos medidas administrativas, técnicas e físicas razoáveis, incluindo conexões criptografadas (HTTPS), senhas com hash, criptografia de documentos de identificação e acesso restrito e registrado a dados sensíveis. Nenhum sistema é 100% seguro; se tomarmos conhecimento de um incidente que afete seus dados, avisaremos você conforme exigido por lei.",
      ],
    },
    {
      id: "retention",
      title: "8. Por quanto tempo guardamos",
      body: [
        "Guardamos dados pessoais enquanto sua conta estiver ativa e pelo tempo necessário para oferecer a Plataforma. Quando você pedir a exclusão da conta, excluiremos ou anonimizaremos seus dados em até [prazo de retenção], exceto quando precisarmos guardá-los por mais tempo para cumprir obrigações legais, resolver disputas ou fazer valer nossos contratos. Os registros de auditoria são guardados por [prazo de retenção da auditoria].",
      ],
    },
    {
      id: "rights",
      title: "9. Suas escolhas e direitos",
      body: [
        "Você pode revisar e atualizar a maior parte dos seus dados na sua conta a qualquer momento. Dependendo do estado onde você mora, você também pode ter o direito de:",
        [
          "saber quais dados pessoais temos sobre você e receber uma cópia;",
          "corrigir dados incorretos;",
          "excluir seus dados pessoais;",
          "limitar o uso dos seus dados pessoais sensíveis;",
          "não ser discriminado por exercer esses direitos.",
        ],
        "Para exercer esses direitos, fale conosco em [email de privacidade]. Vamos confirmar sua identidade antes de responder e responderemos no prazo exigido por lei. Você pode usar um representante autorizado quando a lei permitir.",
      ],
    },
    {
      id: "california",
      title: "10. Residentes da Califórnia",
      body: [
        "Se você mora na Califórnia, a California Consumer Privacy Act, alterada pela California Privacy Rights Act (CCPA/CPRA), garante os direitos descritos na seção 9. Nos últimos 12 meses, coletamos as categorias de dados descritas na seção 1 (identificadores, dados profissionais ou de emprego, dados pessoais sensíveis e dados de atividade na internet), de você e do seu uso da Plataforma, para as finalidades descritas na seção 3.",
        "Não vendemos nem compartilhamos dados pessoais para publicidade comportamental entre contextos, e não usamos nem divulgamos dados pessoais sensíveis para finalidades além das permitidas pela CCPA.",
      ],
    },
    {
      id: "children",
      title: "11. Menores de idade",
      body: [
        "A Plataforma é apenas para pessoas com 18 anos ou mais. Não coletamos intencionalmente dados de menores de 18 anos. Se acreditar que um menor criou uma conta, fale conosco e ela será excluída.",
      ],
    },
    {
      id: "changes",
      title: "12. Alterações nesta Política",
      body: [
        "Podemos atualizar esta Política periodicamente. Quando houver mudanças relevantes, atualizaremos a data no topo desta página e, quando apropriado, avisaremos você.",
      ],
    },
    {
      id: "contact",
      title: "13. Contato",
      body: [
        "Dúvidas ou pedidos sobre privacidade podem ser enviados para [email de privacidade] ou por correio para [Razão social da empresa], [endereço].",
      ],
    },
  ],
};
