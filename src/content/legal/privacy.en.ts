import type { LegalDocument } from "./types";

// Versão oficial (em caso de divergência, prevalece o inglês).
// Itens [entre colchetes] precisam ser preenchidos antes de publicar.
// Mantenha alinhado com o que o sistema faz: ao adicionar analytics, email
// marketing ou novos fornecedores, atualize as seções 3, 5 e 6.
export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  updatedAt: "2026-09-29",
  intro: [
    'This Privacy Policy explains how [Company legal name] ("Carvalho Group", "we", "us" or "our") collects, uses, shares and protects personal information when you use Carvalho Group Jobs (the "Platform").',
    "It applies to Candidates, Employers and visitors. By using the Platform you acknowledge this Policy, which is part of our Terms of Use.",
  ],
  sections: [
    {
      id: "collect",
      title: "1. Information We Collect",
      body: [
        "Information you give us:",
        [
          "Account information: name, email address and password (stored only as a secure hash, never in plain text), plus confirmation that you are 18 or older and your acceptance of our Terms.",
          "Candidate profile: phone number, date of birth (optional), street address (optional), city, state and ZIP code, desired job, skills, education, and whether you are authorized to work in the United States and need visa sponsorship.",
          "Identity documents (optional): Social Security Number (SSN) and passport number, if you choose to provide them.",
          "Employer information: company name, EIN (optional), website (optional), phone number, city and state, the account owner's contact details, and the job listings you publish.",
        ],
        "Information collected automatically:",
        [
          "A session cookie that keeps you signed in. We do not use advertising or analytics cookies.",
          "Technical data processed by our hosting provider to deliver and secure the Platform, such as IP address, browser type and request logs.",
          "For actions taken by our staff in the administration area, the date, time and IP address of each action, kept in an audit log.",
        ],
      ],
    },
    {
      id: "sensitive",
      title: "2. Sensitive Information",
      body: [
        "Some information, such as your SSN, passport number and date of birth, is considered sensitive personal information under certain state laws. Providing it is always optional.",
        "SSN and passport numbers are encrypted before being stored, are never shown to Employers on the Platform and are displayed only in masked form (for example, •••-••-1234). Only authorized Carvalho Group staff can reveal the full number, when needed for hiring or onboarding, and every reveal is recorded in an audit log.",
        "Your date of birth is never shown to Employers. We use sensitive information only for the purposes described in this Policy and do not use it to infer characteristics about you.",
      ],
    },
    {
      id: "use",
      title: "3. How We Use Information",
      body: [
        [
          "To create and manage accounts and keep you signed in.",
          "To show job listings, and to let Candidates build profiles and apply to jobs.",
          "To share Candidate profiles with Employers during a hiring process.",
          "To review and approve Employer accounts and prevent fraudulent job postings.",
          "To send service messages, such as password reset emails.",
          "To secure the Platform, prevent abuse and comply with legal obligations.",
          "To improve the Platform.",
        ],
        "We do not sell your personal information and do not use it for targeted advertising.",
      ],
    },
    {
      id: "share",
      title: "4. How We Share Information",
      body: [
        [
          "With Employers: when you apply to a job or take part in a hiring process, the Employer can see your profile information, except your SSN, passport number and date of birth.",
          "With service providers that help us operate the Platform, under contracts that limit their use of the data (see section 5).",
          "When required by law, or to protect the rights, safety and property of our users, Carvalho Group or the public.",
          "In connection with a merger, acquisition or sale of assets, subject to this Policy.",
        ],
        "Employer company names are kept confidential on public job listings.",
      ],
    },
    {
      id: "providers",
      title: "5. Service Providers",
      body: [
        "We currently use:",
        [
          "Vercel, to host the Platform;",
          "Neon, to store our database;",
          "Google Maps Platform, to suggest addresses and cities while you type — the text you type in those fields is sent to Google to generate suggestions;",
          "[Email provider], to send service emails.",
        ],
        "These providers process data on our behalf and may be located in the United States.",
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies",
      body: [
        "We use a single essential cookie to keep you signed in. It is required for the Platform to work and cannot be turned off while you are signed in. We may also store small preferences in your browser. We do not use third-party advertising or analytics cookies.",
      ],
    },
    {
      id: "security",
      title: "7. Security",
      body: [
        "We use reasonable administrative, technical and physical safeguards, including encrypted connections (HTTPS), hashed passwords, encryption of identity documents and restricted, logged access to sensitive data. No system is 100% secure; if we become aware of a breach affecting your information, we will notify you as required by law.",
      ],
    },
    {
      id: "retention",
      title: "8. Data Retention",
      body: [
        "We keep personal information while your account is active and as needed to provide the Platform. When you ask us to delete your account, we delete or anonymize your information within [retention period], except where we must keep it longer to comply with legal obligations, resolve disputes or enforce our agreements. Audit logs are kept for [audit log retention period].",
      ],
    },
    {
      id: "rights",
      title: "9. Your Choices and Rights",
      body: [
        "You can review and update most of your information in your account at any time. Depending on the state where you live, you may also have the right to:",
        [
          "know what personal information we have about you and receive a copy;",
          "correct inaccurate information;",
          "delete your personal information;",
          "limit the use of your sensitive personal information;",
          "not be discriminated against for exercising these rights.",
        ],
        "To exercise these rights, contact us at [privacy contact email]. We will verify your identity before responding and reply within the time required by law. You may use an authorized agent where the law allows.",
      ],
    },
    {
      id: "california",
      title: "10. California Residents",
      body: [
        "If you live in California, the California Consumer Privacy Act, as amended by the California Privacy Rights Act (CCPA/CPRA), gives you the rights described in section 9. In the last 12 months we collected the categories of information described in section 1 (identifiers, professional or employment-related information, sensitive personal information and internet activity data), from you and from your use of the Platform, for the purposes described in section 3.",
        "We do not sell or share personal information for cross-context behavioral advertising, and we do not use or disclose sensitive personal information for purposes other than those permitted by the CCPA.",
      ],
    },
    {
      id: "children",
      title: "11. Children",
      body: [
        "The Platform is only for people 18 or older. We do not knowingly collect information from anyone under 18. If you believe a minor has created an account, contact us and we will delete it.",
      ],
    },
    {
      id: "changes",
      title: "12. Changes to This Policy",
      body: [
        "We may update this Policy from time to time. When we make material changes, we will update the date at the top of this page and, when appropriate, notify you.",
      ],
    },
    {
      id: "contact",
      title: "13. Contact",
      body: [
        "Questions or requests about privacy can be sent to [privacy contact email] or by mail to [Company legal name], [mailing address].",
      ],
    },
  ],
};
