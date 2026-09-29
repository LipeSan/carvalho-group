import type { LegalDocument } from "./types";

// Traducción de conveniencia; la versión en inglés es la oficial.
// Los ítems [entre corchetes] deben completarse antes de publicar.
export const privacyEs: LegalDocument = {
  title: "Política de Privacidad",
  updatedAt: "2026-09-29",
  intro: [
    'Esta Política de Privacidad explica cómo [Razón social de la empresa] ("Carvalho Group", "nosotros" o "nuestro") recopila, usa, comparte y protege los datos personales cuando usas Carvalho Group Jobs (la "Plataforma").',
    "Se aplica a Candidatos, Empresas y visitantes. Al usar la Plataforma, reconoces esta Política, que forma parte de nuestros Términos de Uso.",
  ],
  sections: [
    {
      id: "collect",
      title: "1. Datos que recopilamos",
      body: [
        "Datos que nos proporcionas:",
        [
          "Datos de la cuenta: nombre, email y contraseña (guardada solo como hash seguro, nunca en texto), además de la confirmación de que tienes 18 años o más y la aceptación de los Términos.",
          "Perfil del Candidato: teléfono, fecha de nacimiento (opcional), dirección (opcional), ciudad, estado y código postal, trabajo deseado, habilidades, escolaridad y si tienes autorización para trabajar en los Estados Unidos y necesitas patrocinio de visa.",
          "Documentos de identificación (opcionales): Social Security Number (SSN) y número de pasaporte, si decides informarlos.",
          "Datos de la Empresa: nombre de la empresa, EIN (opcional), sitio web (opcional), teléfono, ciudad y estado, datos de contacto del responsable de la cuenta y los empleos que publica.",
        ],
        "Datos recopilados automáticamente:",
        [
          "Una cookie de sesión que te mantiene conectado. No usamos cookies de publicidad ni de analítica.",
          "Datos técnicos procesados por nuestro proveedor de alojamiento para entregar y proteger la Plataforma, como dirección IP, tipo de navegador y registros de acceso.",
          "En las acciones realizadas por nuestro equipo en el área administrativa, la fecha, la hora y la dirección IP de cada acción, guardadas en un registro de auditoría.",
        ],
      ],
    },
    {
      id: "sensitive",
      title: "2. Datos sensibles",
      body: [
        "Algunos datos, como el SSN, el número de pasaporte y la fecha de nacimiento, se consideran datos personales sensibles según ciertas leyes estatales. Informarlos siempre es opcional.",
        "El SSN y el número de pasaporte se cifran antes de guardarse, nunca se muestran a las Empresas en la Plataforma y solo aparecen enmascarados (por ejemplo, •••-••-1234). Solo empleados autorizados de Carvalho Group pueden mostrar el número completo, cuando sea necesario para la contratación o incorporación, y cada vez queda registrada en la auditoría.",
        "Tu fecha de nacimiento nunca se muestra a las Empresas. Usamos los datos sensibles solo para los fines descritos en esta Política y no los usamos para inferir características sobre ti.",
      ],
    },
    {
      id: "use",
      title: "3. Cómo usamos los datos",
      body: [
        [
          "Para crear y gestionar cuentas y mantenerte conectado.",
          "Para mostrar empleos y permitir que los Candidatos creen su perfil y se postulen.",
          "Para compartir el perfil de los Candidatos con Empresas durante un proceso de selección.",
          "Para revisar y aprobar cuentas de Empresa y evitar empleos fraudulentos.",
          "Para enviar mensajes del servicio, como emails de restablecimiento de contraseña.",
          "Para proteger la Plataforma, evitar abusos y cumplir obligaciones legales.",
          "Para mejorar la Plataforma.",
        ],
        "No vendemos tus datos personales ni los usamos para publicidad dirigida.",
      ],
    },
    {
      id: "share",
      title: "4. Con quién compartimos",
      body: [
        [
          "Con Empresas: cuando te postulas o participas en un proceso de selección, la Empresa puede ver la información de tu perfil, excepto el SSN, el número de pasaporte y la fecha de nacimiento.",
          "Con proveedores de servicios que nos ayudan a operar la Plataforma, bajo contratos que limitan el uso de los datos (ver sección 5).",
          "Cuando lo exija la ley, o para proteger los derechos, la seguridad y los bienes de los usuarios, de Carvalho Group o del público.",
          "En caso de fusión, adquisición o venta de activos, sujeto a esta Política.",
        ],
        "El nombre de las Empresas se mantiene confidencial en los empleos públicos.",
      ],
    },
    {
      id: "providers",
      title: "5. Proveedores de servicios",
      body: [
        "Actualmente usamos:",
        [
          "Vercel, para alojar la Plataforma;",
          "Neon, para guardar nuestra base de datos;",
          "Google Maps Platform, para sugerir direcciones y ciudades mientras escribes — el texto que escribes en esos campos se envía a Google para generar las sugerencias;",
          "[Proveedor de email], para enviar emails del servicio.",
        ],
        "Estos proveedores tratan datos en nuestro nombre y pueden estar ubicados en los Estados Unidos.",
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies",
      body: [
        "Usamos una sola cookie esencial para mantenerte conectado. Es necesaria para que la Plataforma funcione y no puede desactivarse mientras estés conectado. También podemos guardar pequeñas preferencias en tu navegador. No usamos cookies de publicidad ni de analítica de terceros.",
      ],
    },
    {
      id: "security",
      title: "7. Seguridad",
      body: [
        "Adoptamos medidas administrativas, técnicas y físicas razonables, incluidas conexiones cifradas (HTTPS), contraseñas con hash, cifrado de documentos de identificación y acceso restringido y registrado a datos sensibles. Ningún sistema es 100 % seguro; si tomamos conocimiento de un incidente que afecte tus datos, te avisaremos según lo exija la ley.",
      ],
    },
    {
      id: "retention",
      title: "8. Cuánto tiempo los guardamos",
      body: [
        "Guardamos los datos personales mientras tu cuenta esté activa y el tiempo necesario para ofrecer la Plataforma. Cuando solicites eliminar tu cuenta, eliminaremos o anonimizaremos tus datos en un plazo de [plazo de retención], salvo cuando debamos conservarlos más tiempo para cumplir obligaciones legales, resolver disputas o hacer cumplir nuestros contratos. Los registros de auditoría se guardan durante [plazo de retención de la auditoría].",
      ],
    },
    {
      id: "rights",
      title: "9. Tus opciones y derechos",
      body: [
        "Puedes revisar y actualizar la mayor parte de tus datos en tu cuenta en cualquier momento. Según el estado donde vivas, también puedes tener derecho a:",
        [
          "saber qué datos personales tenemos sobre ti y recibir una copia;",
          "corregir datos incorrectos;",
          "eliminar tus datos personales;",
          "limitar el uso de tus datos personales sensibles;",
          "no ser discriminado por ejercer estos derechos.",
        ],
        "Para ejercer estos derechos, escríbenos a [email de privacidad]. Verificaremos tu identidad antes de responder y responderemos en el plazo exigido por la ley. Puedes usar un representante autorizado cuando la ley lo permita.",
      ],
    },
    {
      id: "california",
      title: "10. Residentes de California",
      body: [
        "Si vives en California, la California Consumer Privacy Act, modificada por la California Privacy Rights Act (CCPA/CPRA), te otorga los derechos descritos en la sección 9. En los últimos 12 meses recopilamos las categorías de datos descritas en la sección 1 (identificadores, información profesional o laboral, datos personales sensibles y datos de actividad en internet), de ti y de tu uso de la Plataforma, para los fines descritos en la sección 3.",
        "No vendemos ni compartimos datos personales para publicidad conductual entre contextos, y no usamos ni divulgamos datos personales sensibles para fines distintos de los permitidos por la CCPA.",
      ],
    },
    {
      id: "children",
      title: "11. Menores de edad",
      body: [
        "La Plataforma es solo para personas de 18 años o más. No recopilamos intencionalmente datos de menores de 18 años. Si crees que un menor creó una cuenta, escríbenos y la eliminaremos.",
      ],
    },
    {
      id: "changes",
      title: "12. Cambios en esta Política",
      body: [
        "Podemos actualizar esta Política periódicamente. Cuando haya cambios importantes, actualizaremos la fecha al inicio de esta página y, cuando corresponda, te avisaremos.",
      ],
    },
    {
      id: "contact",
      title: "13. Contacto",
      body: [
        "Las preguntas o solicitudes sobre privacidad pueden enviarse a [email de privacidad] o por correo a [Razón social de la empresa], [dirección].",
      ],
    },
  ],
};
