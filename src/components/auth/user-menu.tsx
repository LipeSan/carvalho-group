"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { BriefcasePlus, LogOut, UserRound, UserRoundPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "candidate" | "employer";
}) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("userMenuLabel")}
            disabled={isPending}
            className="h-9 gap-2 px-1.5"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {getInitials(name)}
            </span>
            <span className="hidden max-w-32 truncate md:inline">
              {name.split(" ")[0]}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <span className="truncate font-normal">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <UserRound />
          {t("myAccount")}
        </DropdownMenuItem>
        {role === "candidate" && (
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <UserRoundPen />
            {t("myProfile")}
          </DropdownMenuItem>
        )}
        {role === "employer" && (
          <DropdownMenuItem onClick={() => router.push("/employers/post-job")}>
            <BriefcasePlus />
            {t("postJob")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => startTransition(() => logout())}
        >
          <LogOut />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
