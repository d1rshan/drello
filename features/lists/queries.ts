import axios from "axios";

export async function createList(
  boardId: string,
  title: string,
  position: number
) {
  const res = await axios.post(`/api/lists`, {
    title,
    position,
    boardId,
  });
  return res.data;
}

export async function updateList(
  listId: string,
  boardId: string,
  title?: string,
  position?: number
) {
  const res = await axios.patch(`/api/lists/${listId}`, {
    boardId,
    title,
    position,
  });
  return res.data;
}
