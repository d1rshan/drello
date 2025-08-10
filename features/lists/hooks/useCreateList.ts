import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createList } from "../queries";

export const useCreateList = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, position }: { title: string; position: number }) =>
      createList(boardId, title, position),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
};
