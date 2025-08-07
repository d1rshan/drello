"use client";

import { IconTrash } from "@tabler/icons-react";

import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBoard, getBoards } from "@/lib/queries/boards";

export function BoardCards() {
  const queryClient = useQueryClient();

  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    staleTime: 5000,
  });

  const { mutate } = useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {boards.map((board: { id: string; title: string; role: string }) => (
        <Card className="@container/card" key={board.id}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {board.title}
            </CardTitle>
            <CardAction>
              <Button
                variant={"destructive"}
                size={"icon"}
                onClick={() => mutate(board.id)}
              >
                <IconTrash />
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
