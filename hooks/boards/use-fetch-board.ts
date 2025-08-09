import { fetchBoard } from "@/lib/queries/boards";
import { BoardData, Card, List } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useFetchBoard = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();

  // Fetch board (lists + cards) from server, then normalize into BoardData shape
  const query = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => fetchBoard(boardId),
    // transform server shape (lists[], cards[]) -> normalized BoardData
    select: (raw: {
      lists: Array<{ id: string; title: string; position: number }>;
      cards: Array<Card>;
    }) => {
      const listsArr = [...raw.lists].sort((a, b) => a.position - b.position);
      const lists: Record<string, List> = {};
      const listOrder: string[] = [];
      for (const l of listsArr) {
        lists[l.id] = {
          id: l.id,
          title: l.title,
          position: l.position,
          boardId: (l as any).boardId,
          cardIds: [],
        };
        listOrder.push(l.id);
      }
      const cardsMap: Record<string, Card> = {};
      for (const c of raw.cards) {
        cardsMap[c.id] = c;
        // push card id into its list's cardIds
        const list = lists[c.listId];
        if (list) list.cardIds.push(c.id);
      }
      // ensure card order inside lists is sorted by position
      for (const lid of listOrder) {
        lists[lid].cardIds.sort(
          (a, b) => (cardsMap[a]?.position ?? 0) - (cardsMap[b]?.position ?? 0)
        );
      }
      return { lists, cards: cardsMap, listOrder } as BoardData;
    },
    // initialData, // optional initialData
  });

  return query;
};
