"use client";

import { IconTrash } from "@tabler/icons-react";

import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface BoardCardsProps {
  userBoards: {
    boards: {
      id: string;
      title: string;
    };
    board_members: {
      id: string;
      userId: string | null;
      boardId: string | null;
      role: "GUEST" | "ADMIN" | null;
    };
  }[];
}

const getBoards = async () => {
  const res = await axios.get("/api/boards");
  return res.data;
};
export function BoardCards({ userBoards }: BoardCardsProps) {
  const queryClient = useQueryClient();

  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    initialData: userBoards,
  });

  const { mutate } = useMutation({
    mutationFn: async (boardId: string) => {
      const res = await axios.delete(`/api/boards/${boardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {boards.map((userBoard: any) => (
        <Card className="@container/card" key={userBoard.boards.id}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {userBoard.boards.title}
            </CardTitle>
            <CardAction>
              <Button
                variant={"destructive"}
                size={"icon"}
                onClick={() => mutate(userBoard.boards.id)}
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
