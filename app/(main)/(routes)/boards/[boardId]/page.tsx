import { redirect } from "next/navigation";

import { isUUID, isABoardMember, currentUser } from "@/lib/server-utils";
import KanbanBoard from "@/components/kanban/kanban-board";

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

  return (
    <main className="board-theme min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <KanbanBoard />
      </div>
    </main>
  );
}
