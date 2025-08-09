import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCard } from "@/lib/queries/cards";
import { uid } from "@/lib/utils";
import { BoardData, Card } from "@/types";

export const useCreateCard = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();
  const createCardMutation = useMutation({
    mutationFn: ({
      listId,
      title,
      position,
    }: {
      listId: string;
      title: string;
      position: number;
    }) => createCard(listId, title, position),
    onMutate: async ({ listId, title, position }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData<BoardData>(["board", boardId]);
      const tempId = uid("card");
      if (!previous) {
        const base: BoardData = { lists: {}, cards: {}, listOrder: [] };
        queryClient.setQueryData(["board", boardId], base);
        return { previous: base, tempId };
      }
      const newCard: Card = { id: tempId, title, position, listId };
      const next: BoardData = {
        ...previous,
        cards: { ...previous.cards, [tempId]: newCard },
        lists: {
          ...previous.lists,
          [listId]: {
            ...previous.lists[listId],
            cardIds: [...previous.lists[listId].cardIds, tempId],
          },
        },
      };
      queryClient.setQueryData(["board", boardId], next);
      return { previous, tempId };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous)
        queryClient.setQueryData(["board", boardId], context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
  });

  return createCardMutation;
};
