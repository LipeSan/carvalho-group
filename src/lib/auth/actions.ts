"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

import { deleteSession } from "./session";

export async function logout(): Promise<void> {
  await deleteSession();
  redirect({ href: "/", locale: await getLocale() });
}
