export async function createCard(
  listId: string,
  title: string,
  position: number
) {
  const res = await fetch(`/api/lists/${listId}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, position }),
  });
  if (!res.ok) throw new Error("Failed to create card");
  return res.json();
}

export async function updateCard(
  cardId: string,
  patch: Partial<{ title: string; position: number; listId: string }>
) {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update card");
  return res.json();
}
