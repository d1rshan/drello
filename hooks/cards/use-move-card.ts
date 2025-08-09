import { updateCard } from "@/lib/queries/cards";
import { BoardData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMoveCard = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();

  const moveCardMutation = useMutation({
    mutationFn: ({
      cardId,
      position,
      listId,
    }: {
      cardId: string;
      position: number;
      listId: string;
    }) => updateCard(cardId, { position, listId }),
    onMutate: async ({ cardId, position, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData<BoardData>(["board", boardId]);
      if (!previous) return { previous };

      // remove cardId from its current list
      const lists = { ...previous.lists };
      const cards = { ...previous.cards };
      const oldListId = cards[cardId].listId;
      lists[oldListId] = {
        ...lists[oldListId],
        cardIds: lists[oldListId].cardIds.filter((id) => id !== cardId),
      };

      // update card
      cards[cardId] = { ...cards[cardId], position, listId };

      // insert into target list at appropriate place (we'll place at end and then sort by position)
      lists[listId] = {
        ...lists[listId],
        cardIds: [...lists[listId].cardIds, cardId],
      };

      // sort cardIds by position
      lists[listId].cardIds.sort(
        (a, b) => (cards[a].position ?? 0) - (cards[b].position ?? 0)
      );

      const next: BoardData = { ...previous, lists, cards };
      queryClient.setQueryData(["board", boardId], next);
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous)
        queryClient.setQueryData(["board", boardId], context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
  });

  return moveCardMutation;
};
