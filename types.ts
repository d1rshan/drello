export type Board = {
  id: string;
  title: string;
  role: "ADMIN" | "GUEST";
};

// types.ts
export interface Card {
  id: string;
  title: string;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}
