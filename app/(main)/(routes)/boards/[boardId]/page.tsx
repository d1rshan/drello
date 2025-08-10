import { redirect } from "next/navigation";

import { isUUID, isABoardMember, currentUser } from "@/lib/server-utils";
import KanbanBoard from "@/components/kanban/kanban-board";
import { getQueryClient } from "@/lib/utils";
import { db } from "@/lib/db";
import { cardsTable, listsTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function BoardIdPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  const queryClient = getQueryClient();

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

  await queryClient.prefetchQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      // TODO: Make this a util ig
      const lists = await db
        .select()
        .from(listsTable)
        .where(eq(listsTable.boardId, boardId));

      if (lists.length === 0) {
        return { lists: [], cards: [] };
      }

      const listIds = lists.map((list) => list.id);

      const cards = await db
        .select()
        .from(cardsTable)
        .where(inArray(cardsTable.listId, listIds));

      return { lists, cards };
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="board-theme min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <KanbanBoard boardId={boardId} />
        </div>
      </main>
    </HydrationBoundary>
  );
}
