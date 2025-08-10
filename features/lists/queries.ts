import axios from "axios";

export async function createList(
  boardId: string,
  title: string,
  position: number
) {
  const res = await axios.post(`/api/boards/${boardId}/lists`, {
    title,
    position,
  });
  return res.data;
}

export async function updateList(
  listId: string,
  patch: Partial<{ title: string; position: number }>
) {
  const res = await axios.patch(`/api/lists/${listId}`, { patch });
  return res.data;
}
