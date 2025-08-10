import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useModal } from "@/hooks/use-modal";

import { createBoard } from "../queries";

export const useCreateBoard = () => {
  const router = useRouter();

  const { onClose } = useModal();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createBoard(title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board Created!");
      onClose();
      router.push(`/boards/${data.id}`);
    },
  });
};
