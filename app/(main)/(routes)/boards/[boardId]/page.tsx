import { redirect } from "next/navigation";

import { currentUser } from "@/lib/auth/current-user";
import { isUUID, isABoardMember } from "@/lib/server-utils";

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

  const isMember = await isABoardMember(user.id, boardId);

  if (!isMember) {
    return redirect("/dashboard");
  }

  return <div>{isMember.role}</div>;
}
