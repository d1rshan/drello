import { useQuery } from "@tanstack/react-query";

import { fetchBoard } from "../queries";

export const useBoard = (boardId: string) => {
  return useQuery({
    queryKey: ["board"],
    queryFn: () => fetchBoard(boardId),
  });
};
