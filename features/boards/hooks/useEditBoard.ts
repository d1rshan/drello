import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { editBoard } from "../queries";

export const useEditBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, title }: { boardId: string; title: string }) =>
      editBoard(boardId, title),
    onSuccess: () => {
      toast.success("Board Edited!");
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};
