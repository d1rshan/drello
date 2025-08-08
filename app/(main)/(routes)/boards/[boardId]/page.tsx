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

  // return <div>{isMember.role}</div>;

  return (
    <main className="board-theme min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-emerald-500" aria-hidden />
            <h1 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              Project Board
            </h1>
          </div>
          {/* <ThemeToggle /> */}
        </header>
        <KanbanBoard />
      </div>
    </main>
  );
}
