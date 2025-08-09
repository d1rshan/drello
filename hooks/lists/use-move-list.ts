import { updateList } from "@/lib/queries/lists";
import { BoardData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMoveList = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();

  const moveListMutation = useMutation({
    mutationFn: ({ listId, position }: { listId: string; position: number }) =>
      updateList(listId, { position }),
    onMutate: async ({ listId, position }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData<BoardData>(["board", boardId]);
      if (!previous) return { previous };
      const lists = { ...previous.lists };
      lists[listId] = { ...lists[listId], position };
      // recompute order
      const order = Object.values(lists)
        .sort((a, b) => a.position - b.position)
        .map((l) => l.id);
      const next: BoardData = { ...previous, lists, listOrder: order };
      queryClient.setQueryData(["board", boardId], next);
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous)
        queryClient.setQueryData(["board", boardId], context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["board", boardId] }), // only "board" is enough ig
  });
  return moveListMutation;
};
