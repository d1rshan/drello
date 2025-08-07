import { redirect } from "next/navigation";

import { BoardCards } from "@/components/board-cards";
import { currentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { boardMembersTable, boardsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  // extra check other than middleware as it only checks for session cookie locally
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userBoards = await db
    .select()
    .from(boardsTable)
    .innerJoin(boardMembersTable, eq(boardsTable.id, boardMembersTable.boardId))
    .where(eq(boardMembersTable.userId, user.id));

  console.log("DASHBOARD_SERVER!");
  return (
    <>
      <BoardCards userBoards={userBoards} />
    </>
  );
}
