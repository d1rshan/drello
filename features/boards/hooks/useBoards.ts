import { useQuery } from "@tanstack/react-query";

import { getBoards } from "../queries";

export const useBoards = () => {
  return useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    // staleTime: 5000,
  });
};
