import axios from "axios";

// these are fetchers for tanstack query, and we have to throw errors for tanstack query to know
// that there is an error but when we use axios, it automatically throws an error
// only if we want to customize the error message or smth than we make an make an resuable util
// to send normalized error which will be called in catch.

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

export const fetchBoard = async (boardId: string) => {
  const res = await axios.get(`/api/boards/${boardId}`);
  return res.data; // expected shape: { lists: List[], cards: Card[] }
};
