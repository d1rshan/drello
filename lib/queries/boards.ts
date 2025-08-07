import axios from "axios";

export const getBoards = async () => {
  const res = await axios.get("/api/boards");
  return res.data;
};

export const deleteBoard = async (boardId: string) => {
  console.log("DELETE");
  const res = await axios.delete(`/api/boards/${boardId}`);
};

export const createBoard = async (title: string) => {
  const res = await axios.post("/api/boards", { title });
};
