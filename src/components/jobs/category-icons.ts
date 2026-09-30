import {
  BrickWall,
  ChefHat,
  ConciergeBell,
  HardHat,
  Martini,
  PaintRoller,
  Receipt,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

import type { CategorySlug } from "@/lib/jobs/options";

// Ícone de cada área de vaga (home e página para empresas).
export const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  plasterer: BrickWall,
  cleaningHelper: SprayCan,
  attendant: ConciergeBell,
  cook: ChefHat,
  cashier: Receipt,
  construction: HardHat,
  painter: PaintRoller,
  bartender: Martini,
};
