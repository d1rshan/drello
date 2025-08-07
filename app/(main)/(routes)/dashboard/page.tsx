import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BoardCards } from "@/components/board-cards";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  // extra check other than middleware as it only checks for session cookie locally
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/sign-in");
  }
  return <BoardCards />;
}
