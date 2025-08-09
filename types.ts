export type Board = {
  id: string;
  title: string;
  role: "ADMIN" | "GUEST";
};

export type Card = {
  id: string;
  title: string;
  position: number;
  listId: string;
};

export type List = {
  id: string;
  title: string;
  position: number;
  boardId: string;
};

export type BoardData = {
  lists: List[];
  cards: Card[];
};
