import { updateCard } from "@/lib/queries/cards";
import { BoardData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRenameCard = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();

  const renameCardMutation = useMutation({
    mutationFn: ({ cardId, title }: { cardId: string; title: string }) =>
      updateCard(cardId, { title }),
    onMutate: async ({ cardId, title }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData<BoardData>(["board", boardId]);
      if (!previous) return { previous };
      const next: BoardData = {
        ...previous,
        cards: {
          ...previous.cards,
          [cardId]: { ...previous.cards[cardId], title },
        },
      };
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

  return renameCardMutation;
};
