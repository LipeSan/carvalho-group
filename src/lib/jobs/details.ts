import { allJobs, type CategorySlug, type PublicJob } from "@/lib/mock-jobs";

// Detalhes de uma vaga. Como título e salário, é conteúdo escrito pela
// empresa e não é traduzido pela plataforma.
export type JobDetails = PublicJob & {
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  schedule: string;
};

// Conteúdo de exemplo por área, até as empresas cadastrarem as vagas.
const TEMPLATES: Record<CategorySlug, Omit<JobDetails, keyof PublicJob>> = {
  plasterer: {
    description:
      "We are looking for an experienced plasterer to join our crew on residential and commercial projects. You will work alongside a team of finishers delivering high-quality interior and exterior surfaces.",
    responsibilities: [
      "Apply plaster, stucco and joint compound to walls and ceilings",
      "Prepare surfaces, install lath and corner beads",
      "Mix materials to the correct consistency",
      "Keep the job site clean and follow safety rules",
    ],
    requirements: [
      "2+ years of plastering or drywall finishing experience",
      "Own basic hand tools",
      "Able to lift 50 lbs and work on scaffolding",
      "Reliable transportation to job sites",
    ],
    benefits: [
      "Weekly pay",
      "Overtime available",
      "Steady work all year",
      "Paid training on new materials",
    ],
    schedule: "Monday – Friday, 7:00 AM – 3:30 PM",
  },
  cleaningHelper: {
    description:
      "Join a friendly cleaning team that takes pride in leaving every space spotless. No experience required — we provide full training and all supplies.",
    responsibilities: [
      "Clean kitchens, bathrooms, bedrooms and common areas",
      "Dust, vacuum, mop and take out trash",
      "Restock supplies and report any damage",
      "Follow the cleaning checklist for each property",
    ],
    requirements: [
      "No experience needed — training provided",
      "Attention to detail and good time management",
      "Able to stand and walk for long periods",
      "Basic English is a plus",
    ],
    benefits: [
      "Weekly pay",
      "Flexible schedule",
      "Supplies and uniform provided",
      "Paid time off after 90 days",
    ],
    schedule: "Monday – Saturday, flexible shifts",
  },
  attendant: {
    description:
      "We are hiring a friendly and reliable attendant to welcome guests and keep our operation running smoothly. Great opportunity for people who enjoy helping others.",
    responsibilities: [
      "Greet guests and answer questions",
      "Keep areas clean, organized and stocked",
      "Handle simple requests and escalate issues to the supervisor",
      "Follow company policies and safety procedures",
    ],
    requirements: [
      "Friendly attitude and good communication",
      "Previous customer service experience is a plus",
      "Available on weekends and holidays",
      "Basic English required",
    ],
    benefits: [
      "Paid training",
      "Employee discounts",
      "Health insurance for full-time staff",
      "Opportunities for promotion",
    ],
    schedule: "Rotating shifts, including weekends",
  },
  cook: {
    description:
      "Our busy kitchen is looking for a cook who loves great food and works well under pressure. You will prepare dishes to recipe standards and keep a clean, safe station.",
    responsibilities: [
      "Prepare and cook menu items following recipes",
      "Set up and stock your station before service",
      "Keep the kitchen clean and follow food safety rules",
      "Receive and store deliveries",
    ],
    requirements: [
      "1+ year of kitchen experience",
      "Food Handler card (or willing to obtain)",
      "Able to work in a fast-paced environment",
      "Available nights and weekends",
    ],
    benefits: [
      "Free shift meals",
      "Weekly pay",
      "Health insurance for full-time staff",
      "Room to grow into Sous Chef",
    ],
    schedule: "5 shifts per week, including weekends",
  },
  cashier: {
    description:
      "We are looking for a cashier who is fast, accurate and friendly. You will be the last person customers see, so a positive attitude makes all the difference.",
    responsibilities: [
      "Process payments accurately (cash, card and mobile)",
      "Help customers with questions and returns",
      "Keep the checkout area clean and stocked",
      "Count the register at the start and end of each shift",
    ],
    requirements: [
      "Basic math skills",
      "Friendly and patient with customers",
      "Previous cashier experience is a plus",
      "Basic English required",
    ],
    benefits: [
      "Employee discount",
      "Flexible schedule",
      "Paid training",
      "401(k) for eligible employees",
    ],
    schedule: "Morning, afternoon and evening shifts available",
  },
  construction: {
    description:
      "We need hard-working construction team members for ongoing residential and commercial projects. Great opportunity to learn new skills and grow with the company.",
    responsibilities: [
      "Load and unload materials and tools",
      "Assist skilled trades with framing, concrete and demolition",
      "Operate basic power tools safely",
      "Keep the job site clean and organized",
    ],
    requirements: [
      "Able to lift 50+ lbs and work outdoors",
      "Construction experience is a plus",
      "OSHA 10 certification is a plus",
      "Own work boots and reliable transportation",
    ],
    benefits: [
      "Weekly pay",
      "Overtime available",
      "Safety equipment provided",
      "On-the-job training",
    ],
    schedule: "Monday – Friday, 6:30 AM – 3:00 PM",
  },
  painter: {
    description:
      "We are hiring a painter for interior and exterior projects. We value clean, detailed work and respect for our clients' homes and businesses.",
    responsibilities: [
      "Prepare surfaces: sanding, patching, caulking and masking",
      "Apply paint and stain with brush, roller and sprayer",
      "Protect furniture and floors and clean up after each job",
      "Communicate progress with the crew leader",
    ],
    requirements: [
      "1+ year of professional painting experience",
      "Experience with sprayers is a plus",
      "Comfortable working on ladders",
      "Reliable transportation",
    ],
    benefits: [
      "Weekly pay",
      "Year-round work",
      "Tools and materials provided",
      "Bonus for quality work",
    ],
    schedule: "Monday – Friday, 7:30 AM – 4:00 PM",
  },
  bartender: {
    description:
      "We are looking for an energetic bartender to create great drinks and a great experience for our guests. Tips are shared fairly and our team is like family.",
    responsibilities: [
      "Prepare cocktails, beer and wine following our recipes",
      "Take orders, handle payments and check IDs",
      "Keep the bar clean, stocked and organized",
      "Provide friendly and fast service",
    ],
    requirements: [
      "Must be 21 or older",
      "1+ year of bartending experience",
      "Responsible alcohol service certification (or willing to obtain)",
      "Available nights, weekends and holidays",
    ],
    benefits: [
      "Great tips",
      "Free shift meals",
      "Flexible schedule",
      "Employee discounts",
    ],
    schedule: "Evenings and weekends",
  },
};

export function getJobById(id: string): JobDetails | null {
  const job = allJobs.find((item) => item.id === id);
  return job ? { ...job, ...TEMPLATES[job.categorySlug] } : null;
}

// Outras vagas da mesma área, das mais recentes para as mais antigas.
export function getSimilarJobs(job: PublicJob, limit = 3): PublicJob[] {
  return allJobs
    .filter(
      (item) => item.categorySlug === job.categorySlug && item.id !== job.id,
    )
    .sort((a, b) => a.postedAgoDays - b.postedAgoDays)
    .slice(0, limit);
}
