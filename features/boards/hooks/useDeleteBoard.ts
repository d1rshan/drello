import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteBoard } from "../queries";

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: (data) => {
      const { title } = data;
      toast.success(`${title} Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};
