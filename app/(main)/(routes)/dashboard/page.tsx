import { redirect } from "next/navigation";

import { BoardCards } from "@/components/dashboard/board-cards";
import { currentUser } from "@/lib/server-utils";

export default async function DashboardPage() {
  // extra check other than middleware as it only checks for session cookie locally
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <BoardCards />;
}
