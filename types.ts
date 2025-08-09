export type Board = {
  id: string;
  title: string;
  role: "ADMIN" | "GUEST";
};

export type Card = {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  listId: string;
};

export type List = {
  id: string;
  title: string;
  position: number;
  boardId?: string;
  cardIds: string[]; // for normalized client state
};

export type BoardData = {
  lists: Record<string, Omit<List, "cardIds"> & { cardIds: string[] }>;
  cards: Record<string, Card>;
  listOrder: string[];
};
