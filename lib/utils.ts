import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function currentUser() {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!currentSession) return null;

  const user = currentSession.user;

  return user;
}
