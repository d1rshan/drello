import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createList } from "@/lib/queries/lists";
import { uid } from "@/lib/utils";
import { BoardData } from "@/types";

export const useCreateList = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();

  const createListMutation = useMutation({
    mutationFn: ({ title, position }: { title: string; position: number }) =>
      createList(boardId, title, position),
    onMutate: async ({ title, position }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData<BoardData>(["board", boardId]);

      const tempId = uid("list");
      const optimistic: BoardData = {
        lists: {
          ...(previous?.lists ?? {}),
          [tempId]: { id: tempId, title, position, boardId, cardIds: [] },
        },
        cards: { ...(previous?.cards ?? {}) },
        listOrder: [...(previous?.listOrder ?? []), tempId],
      };

      queryClient.setQueryData(["board", boardId], optimistic);
      return { previous, tempId };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous)
        queryClient.setQueryData(["board", boardId], context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
  });

  return createListMutation;
};
