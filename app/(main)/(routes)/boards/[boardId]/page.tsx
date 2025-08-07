import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { currentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { boardMembersTable } from "@/lib/db/schema";
import { isUUID } from "@/lib/utils";

export default async function BoardIdPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  if (!isUUID(boardId)) {
    return redirect("/dashboard");
  }

  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const [isABoardMember] = await db
    .select()
    .from(boardMembersTable)
    .where(
      and(
        eq(boardMembersTable.userId, user.id),
        eq(boardMembersTable.boardId, boardId)
      )
    );

  if (!isABoardMember) {
    return redirect("/dashboard");
  }

  return <div>{isABoardMember.role}</div>;
}
