export async function createList(
  boardId: string,
  title: string,
  position: number
) {
  const res = await fetch(`/api/boards/${boardId}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, position }),
  });
  if (!res.ok) throw new Error("Failed to create list");
  return res.json();
}

export async function updateList(
  listId: string,
  patch: Partial<{ title: string; position: number }>
) {
  const res = await fetch(`/api/lists/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update list");
  return res.json();
}
