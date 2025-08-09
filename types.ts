export type Board = {
  id: string;
  title: string;
  role: "ADMIN" | "GUEST";
};

export type Card = {
  id: string;
  title: string;
  description?: string;
};

export type List = {
  id: string;
  title: string;
  cardIds: string[];
};

export type BoardData = {
  lists: Record<string, List>;
  cards: Record<string, Card>;
  listOrder: string[];
};
