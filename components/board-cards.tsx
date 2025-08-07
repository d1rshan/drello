import { IconMenu3 } from "@tabler/icons-react";

import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
export function BoardCards({ userBoards }: BoardCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {userBoards.map((userBoard) => (
        <Card className="@container/card" key={userBoard.boards.id}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {userBoard.boards.title}
            </CardTitle>
            <CardAction>
              <Button variant={"ghost"} size={"icon"}>
                <IconMenu3 />
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
