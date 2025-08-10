"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardData } from "@/types";
import { cn } from "@/lib/utils";

import { ListHeader } from "./list-header";
import { getDraggableStyle, ListCards } from "./list-cards";
import { useBoard } from "@/features/boards/hooks/useBoard";
import { useCreateList } from "@/features/lists/hooks/useCreateList";

export const MOCK_DATA: BoardData = {
  lists: [
    {
      id: "abc",
      title: "To do",
      boardId: "1",
      position: 1,
    },
    {
      id: "def",
      title: "To do",
      boardId: "1",
      position: 2,
    },
    {
      id: "ghi",
      title: "To do",
      boardId: "1",
      position: 2,
    },
  ],
  cards: [
    {
      id: "card-1",
      title: "Design login screen",
      listId: "abc",
      position: 1,
    },
  ],
};

export default function KanbanBoard({ boardId }: { boardId: string }) {
  console.log("KanbanBoard");
  const [data, setData] = useState<BoardData>({ lists: [], cards: [] });

  const { data: boardData, isLoading } = useBoard(boardId);
  const { mutateAsync: createList } = useCreateList(boardId);

  useEffect(() => {
    if (boardData) {
      console.log("this is fetched data", boardData);
      setData(boardData);
    }
  }, [boardData]);

  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const listInputRef = useRef<HTMLInputElement | null>(null);

  const addList = useCallback(async (title: string) => {
    if (!title.trim()) return;
    console.log("HELLo");
    await createList({ title, position: data.lists.length + 1 });
    setData((prev) => ({
      ...prev,
      lists: [
        ...prev.lists,
        {
          id: Date.now().toString(),
          boardId: "1",
          position: prev.lists.length,
          title,
        },
      ],
    }));
  }, []);

  // === Add card ===
  const addCard = useCallback(
    (listId: string, title: string, position: number) => {
      if (!title.trim()) return;
      setData((prev) => ({
        ...prev,
        cards: [
          ...prev.cards,
          {
            id: Date.now().toString(),
            listId,
            title,
            position,
          },
        ],
      }));
    },
    []
  );

  // === Rename list ===
  const renameList = useCallback((listId: string, title: string) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, title } : list
      ),
    }));
  }, []);

  // === Rename card ===
  const renameCard = useCallback((cardId: string, title: string) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === cardId ? { ...card, title } : card
      ),
    }));
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    // If position didn't change, no update needed
    if (
      destination.droppableId === source.droppableId && // no move
      destination.index === source.index // no reorder
    ) {
      return;
    }

    // === 1. Moving a LIST ===
    if (type === "LIST") {
      setData((prev) => {
        const newLists = Array.from(prev.lists);
        const [movedList] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, movedList);

        // Update positions based on array order
        const updatedLists = newLists.map((list, idx) => ({
          ...list,
          position: idx,
        }));

        return { ...prev, lists: updatedLists };
      });
      return;
    }

    // === 2 & 3. Moving a CARD ===
    setData((prev) => {
      const startListId = source.droppableId;
      const finishListId = destination.droppableId;

      // Get all cards in start & finish lists
      const startCards = prev.cards
        .filter((c) => c.listId === startListId)
        .sort((a, b) => a.position - b.position);

      const finishCards =
        startListId === finishListId
          ? startCards
          : prev.cards
              .filter((c) => c.listId === finishListId)
              .sort((a, b) => a.position - b.position);

      // Find the moved card
      const movedCardIndex = startCards.findIndex((c) => c.id === draggableId);
      const [movedCard] = startCards.splice(movedCardIndex, 1);

      if (startListId === finishListId) {
        // === Moving within same list ===
        startCards.splice(destination.index, 0, movedCard);
        const updatedCards = prev.cards.map((card) => {
          if (card.listId !== startListId) return card;
          const idx = startCards.findIndex((c) => c.id === card.id);
          return { ...card, position: idx };
        });

        return { ...prev, cards: updatedCards };
      } else {
        // === Moving to a different list ===
        finishCards.splice(destination.index, 0, {
          ...movedCard,
          listId: finishListId,
        });

        const updatedCards = prev.cards.map((card) => {
          if (card.id === movedCard.id) {
            return {
              ...card,
              listId: finishListId,
              position: destination.index,
            };
          }
          if (card.listId === startListId) {
            const idx = startCards.findIndex((c) => c.id === card.id);
            return { ...card, position: idx };
          }
          if (card.listId === finishListId) {
            const idx = finishCards.findIndex((c) => c.id === card.id);
            return { ...card, position: idx };
          }
          return card;
        });

        return { ...prev, cards: updatedCards };
      }
    });
  }, []);

  if (isLoading) {
    return <div> Loading...</div>;
  }
  return (
    <div className="relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div className="board-scroll no-scrollbar flex h-[calc(100vh-140px)] items-start gap-3 overflow-x-auto pb-6 pr-3">
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-start gap-3"
              >
                {data.lists
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((list, index) => {
                    const listCards = data.cards
                      .filter((c) => c.listId === list.id)
                      .sort((a, b) => a.position - b.position);

                    return (
                      <Draggable
                        draggableId={list.id}
                        index={index}
                        key={list.id}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={getDraggableStyle(
                              dragProvided.draggableProps.style,
                              dragSnapshot
                            )}
                            className={cn(
                              "flex max-h-[calc(100vh-140px)] flex-col w-[272px] min-w-[272px] max-w-[272px] basis-[272px] flex-shrink-0",
                              "rounded-md bg-zinc-100/70 p-2 shadow-sm border border-zinc-200 overflow-hidden",
                              "dark:bg-zinc-900/50 dark:border-zinc-800",
                              dragSnapshot.isDragging &&
                                "shadow-lg border-black/40 dark:border-white/50"
                            )}
                          >
                            <ListHeader
                              title={list.title}
                              onRename={(t) => renameList(list.id, t)}
                              dragHandleProps={dragProvided.dragHandleProps}
                            />
                            <ListCards
                              listId={list.id}
                              cards={listCards}
                              onAddCard={(t) =>
                                addCard(list.id, t, listCards.length)
                              }
                              onRenameCard={renameCard}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>

              {/* Add list composer */}
              <div className="w-[272px] flex-shrink-0">
                {addingList ? (
                  <div className="rounded-md bg-zinc-100/70 p-2 shadow-sm border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
                    <Input
                      ref={listInputRef}
                      autoFocus
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newListTitle.trim()) {
                          addList(newListTitle);
                          setNewListTitle("");
                          requestAnimationFrame(() =>
                            listInputRef.current?.focus()
                          );
                        } else if (e.key === "Escape") {
                          setAddingList(false);
                          setNewListTitle("");
                        }
                      }}
                      placeholder="Enter list title..."
                      className="mb-2 bg-white dark:bg-zinc-900"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!newListTitle.trim()) return;
                          addList(newListTitle);
                          setNewListTitle("");
                          requestAnimationFrame(() =>
                            listInputRef.current?.focus()
                          );
                        }}
                        className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      >
                        Add list
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAddingList(false);
                          setNewListTitle("");
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingList(true)}
                    className="flex w-full items-center gap-2 rounded-md bg-zinc-100/60 p-3 text-left text-sm text-zinc-700 transition hover:bg-zinc-200/80 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:bg-zinc-900/70"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Scoped styles */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
