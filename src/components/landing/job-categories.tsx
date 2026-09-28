import { useTranslations } from "next-intl";
import {
  Banknote,
  Code2,
  Megaphone,
  Palette,
  Settings2,
  ShoppingCart,
  UserCircle2,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { jobCategories, type CategorySlug } from "@/lib/mock-jobs";

const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  technology: Code2,
  sales: ShoppingCart,
  marketing: Megaphone,
  administrative: UserCircle2,
  design: Palette,
  finance: Banknote,
  humanResources: Users,
  operations: Settings2,
};

export function JobCategories() {
  const t = useTranslations("Categories");
  const tList = useTranslations("Categories.list");

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          {t("eyebrow")}
        </span>
        <h2 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {jobCategories.map((category) => {
          const Icon = CATEGORY_ICONS[category.slug];
          return (
            <Link
              key={category.slug}
              href={`/vagas?categoria=${category.slug}`}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-heading text-base font-semibold">
                  {tList(category.slug)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("jobsCount", { count: category.count })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
