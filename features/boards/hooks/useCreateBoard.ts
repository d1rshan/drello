import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBoard } from "../queries";

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createBoard(title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};
