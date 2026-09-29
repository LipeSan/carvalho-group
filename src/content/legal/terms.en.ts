import type { LegalDocument } from "./types";

// Versão oficial (em caso de divergência, prevalece o inglês).
// Itens [entre colchetes] precisam ser preenchidos antes de publicar.
export const termsEn: LegalDocument = {
  title: "Terms of Use",
  updatedAt: "2026-09-29",
  intro: [
    'These Terms of Use (the "Terms") govern your access to and use of Carvalho Group Jobs, including our website, job listings and related services (together, the "Platform"), operated by [Company legal name] ("Carvalho Group", "we", "us" or "our").',
    "By creating an account or using the Platform, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Platform.",
  ],
  sections: [
    {
      id: "platform",
      title: "1. About the Platform",
      body: [
        'Carvalho Group Jobs connects people looking for work ("Candidates") with companies that are hiring ("Employers") in the United States.',
        "Unless expressly stated in a job listing, Carvalho Group is not the employer, does not make hiring decisions and does not guarantee that any Candidate will be hired or that any Employer will find a suitable Candidate.",
        "To protect Employers during the early stages of hiring, company names may be kept confidential on job listings and shared with Candidates later in the hiring process.",
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      body: [
        "You must be at least 18 years old to create an account and use the Platform. By creating an account, you confirm that you meet this requirement.",
        "Employer accounts may only be created by people authorized to act on behalf of the company they register.",
      ],
    },
    {
      id: "accounts",
      title: "3. Your Account",
      body: [
        "You agree to provide accurate, current and complete information and to keep it up to date.",
        "You are responsible for keeping your password confidential and for all activity under your account. Notify us immediately at [contact email] if you suspect unauthorized use.",
        "Each person may keep only one Candidate account. We may suspend or close accounts that violate these Terms, provide false information or put other users at risk.",
      ],
    },
    {
      id: "candidates",
      title: "4. Terms for Candidates",
      body: [
        "Your profile information (such as contact details, desired job, skills, education and work authorization answers) may be shared with Employers when you apply to a job or take part in a hiring process.",
        "Providing your Social Security Number or passport number is optional. When provided, these documents are stored encrypted and are never displayed to Employers on the Platform; they may be accessed only by authorized Carvalho Group staff when needed for hiring or onboarding, and every access is logged.",
        "You are responsible for verifying job offers and Employers before sharing additional personal information outside the Platform. We will never ask you to pay to apply for a job.",
      ],
    },
    {
      id: "employers",
      title: "5. Terms for Employers",
      body: [
        "Employer accounts are reviewed before they can publish jobs. We may approve, reject or later suspend any company at our discretion, including when information cannot be verified.",
        "By posting a job, you represent that:",
        [
          "the job is real, currently open and offered by your company;",
          "the listing complies with all applicable laws, including federal, state and local equal employment opportunity (EEO) and anti-discrimination laws;",
          "the listing includes pay information where required by state or local pay transparency laws;",
          "you will not charge Candidates any fee to apply, interview or be hired;",
          "you will use Candidate information only to evaluate and hire for your open positions, and not for marketing, resale or any other purpose.",
        ],
        "We may edit, close or remove any job listing that violates these Terms or that we reasonably believe to be misleading or fraudulent.",
      ],
    },
    {
      id: "conduct",
      title: "6. Prohibited Conduct",
      body: [
        "You agree not to:",
        [
          "post false, misleading, fraudulent or discriminatory content;",
          "impersonate any person or company, or misrepresent your affiliation;",
          "collect or harvest other users' data, including by scraping or automated means;",
          "send spam or unsolicited commercial messages to other users;",
          "interfere with the security or operation of the Platform, or try to access accounts or data you are not authorized to access;",
          "use the Platform for any unlawful purpose.",
        ],
      ],
    },
    {
      id: "content",
      title: "7. Content",
      body: [
        "You keep ownership of the content you submit (such as your profile or job listings). You grant Carvalho Group a non-exclusive, worldwide, royalty-free license to host, display and process that content as needed to operate and improve the Platform.",
        "The Platform, including its design, logos and software, belongs to Carvalho Group and may not be copied or used without our written permission.",
      ],
    },
    {
      id: "privacy",
      title: "8. Privacy",
      body: [
        "Our Privacy Policy explains how we collect, use and protect personal information. It is part of these Terms.",
      ],
    },
    {
      id: "fees",
      title: "9. Fees",
      body: [
        "The Platform is free for Candidates. Employers may be offered paid plans; any fees and payment terms will be presented before purchase.",
      ],
    },
    {
      id: "disclaimers",
      title: "10. Disclaimers",
      body: [
        'The Platform is provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose and non-infringement.',
        "We do not guarantee the accuracy of job listings or user profiles, the conduct of any user, or that the Platform will be uninterrupted or error-free.",
      ],
    },
    {
      id: "liability",
      title: "11. Limitation of Liability",
      body: [
        "To the fullest extent permitted by law, Carvalho Group will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, data or employment opportunities, arising from your use of the Platform.",
        "Our total liability for any claim related to the Platform will not exceed the greater of the amount you paid us in the 12 months before the claim or US$100.",
      ],
    },
    {
      id: "indemnification",
      title: "12. Indemnification",
      body: [
        "You agree to indemnify and hold Carvalho Group harmless from any claims, damages and expenses (including reasonable attorneys' fees) arising from your content, your use of the Platform or your violation of these Terms or of any law.",
      ],
    },
    {
      id: "termination",
      title: "13. Termination",
      body: [
        "You may stop using the Platform at any time. We may suspend or terminate your access if you violate these Terms or if required by law. Sections that by their nature should survive termination will continue to apply.",
      ],
    },
    {
      id: "law",
      title: "14. Governing Law and Disputes",
      body: [
        "These Terms are governed by the laws of the State of [State], without regard to its conflict of laws rules. Any dispute will be resolved in the state or federal courts located in [County, State], unless applicable law requires otherwise.",
      ],
    },
    {
      id: "changes",
      title: "15. Changes to These Terms",
      body: [
        "We may update these Terms from time to time. When we make material changes, we will update the date at the top of this page and, when appropriate, notify you. Continuing to use the Platform after changes take effect means you accept the updated Terms.",
      ],
    },
    {
      id: "contact",
      title: "16. Contact",
      body: [
        "Questions about these Terms can be sent to [contact email] or by mail to [Company legal name], [mailing address].",
      ],
    },
  ],
};
