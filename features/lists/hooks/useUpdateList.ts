import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateList } from "../queries";

export const useUpdateList = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      position,
      listId,
    }: {
      listId: string;
      title?: string;
      position?: number;
    }) => updateList(listId, boardId, title, position),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
};
