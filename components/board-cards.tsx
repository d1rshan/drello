"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getBoards } from "@/lib/queries/boards";
import { Board } from "@/types";

export function BoardCards() {
  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    staleTime: 5000,
  });

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {boards.map((board: Board) => (
        <Link href={`/boards/${board.id}`}>
          <Card className="@container/card cursor-pointer" key={board.id}>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {board.title}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
