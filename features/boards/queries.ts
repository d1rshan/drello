import axios from "axios";

export const getBoards = async () => {
  const res = await axios.get("/api/boards");
  return res.data;
};

export const deleteBoard = async (boardId: string) => {
  console.log("DELETE");
  const res = await axios.delete(`/api/boards/${boardId}`);
  return res.data;
};

export const createBoard = async (title: string) => {
  const res = await axios.post("/api/boards", { title });
  return res.data;
};

export const editBoard = async (boardId: string, title: string) => {
  const res = await axios.patch(`/api/boards/${boardId}`, { title });
  return res.data;
};

export async function fetchBoard(boardId: string) {
  const res = await fetch(`/api/boards/${boardId}`);
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json(); // expected shape: { lists: List[], cards: Card[] }
}
