import {
  BriefcaseBusiness,
  HeartHandshake,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { ServiceSlug } from "@/lib/services";

export const SERVICE_ICONS: Record<ServiceSlug, LucideIcon> = {
  "business-consulting": BriefcaseBusiness,
  "personal-advisory": UserRoundCheck,
  "life-insurance": HeartHandshake,
  jobs: UsersRound,
};
