import { updateList } from "@/lib/queries/lists";
import { BoardData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRenameList = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();

  const renameListMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) =>
      updateList(listId, { title }),
    onMutate: async ({ listId, title }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData<BoardData>(["board", boardId]);
      if (!previous) return { previous };

      const next: BoardData = {
        ...previous,
        lists: {
          ...previous.lists,
          [listId]: { ...previous.lists[listId], title },
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

  return renameListMutation;
};
