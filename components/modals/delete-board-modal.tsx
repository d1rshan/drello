import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { deleteBoard } from "@/lib/queries/boards";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function DeleteBoardModal() {
  const { isOpen, onClose, data, type } = useModal();
  const queryClient = useQueryClient();

  const isModalOpen = isOpen && type === "deleteBoard";

  const { mutate } = useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: (data) => {
      const { title } = data;
      toast.success(`${title} Deleted!`);
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const { boardTitle, boardId } = data;
  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold">{boardTitle} </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutate(boardId!)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
