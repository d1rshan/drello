"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ListHeader } from "./list-header";
import { ListCards } from "./list-cards";
import { BoardData } from "@/types";
import { useCreateList } from "@/hooks/lists/use-create-list";
import { useRenameList } from "@/hooks/lists/use-rename-list";
import { useCreateCard } from "@/hooks/cards/use-create-card";
import { useRenameCard } from "@/hooks/cards/use-rename-card";
import { useMoveList } from "@/hooks/lists/use-move-list";
import { useMoveCard } from "@/hooks/cards/use-move-card";
import { useFetchBoard } from "@/hooks/boards/use-fetch-board";

// -----------------------------
// Utility: compute a position between neighbors (floating position technique)
// - if inserting at 0 -> before first, return first/2
// - if inserting at end -> last + 1
// - else -> (before + after) / 2
// -----------------------------
function computePositionBetween(sortedPositions: number[], destIndex: number) {
  if (sortedPositions.length === 0) return 1.0;
  if (destIndex <= 0) {
    return sortedPositions[0] / 2;
  }
  if (destIndex >= sortedPositions.length) {
    return sortedPositions[sortedPositions.length - 1] + 1.0;
  }
  const before = sortedPositions[destIndex - 1];
  const after = sortedPositions[destIndex];
  return (before + after) / 2;
}

export function getDraggableStyle(
  style: any,
  snapshot: { isDragging: boolean; isDropAnimating: boolean }
) {
  if (!style) return style;
  if (snapshot.isDropAnimating) {
    // Snap in place instantly on drop
    return { ...style, transitionDuration: "0.001s" };
  }
  if (snapshot.isDragging) {
    return { ...style, willChange: "transform" };
  }
  return style;
}

// -----------------------------
// Main KanbanBoard component (UI unchanged — adapted data layer)
// -----------------------------
export default function KanbanBoard({
  boardId,
  initialData,
}: {
  boardId: string;
  initialData?: BoardData;
}) {
  const queryClient = useQueryClient();

  const { data: serverData, isLoading } = useFetchBoard({ boardId });

  // Local UI state (same as before)
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  // -----------------------------
  // Mutations with optimistic updates
  // -----------------------------
  const createListMutation = useCreateList({ boardId });

  const renameListMutation = useRenameList({ boardId });

  const createCardMutation = useCreateCard({ boardId });

  const renameCardMutation = useRenameCard({ boardId });

  // Move list (update list.position)
  const moveListMutation = useMoveList({ boardId });
  // Move card (update card.position and maybe card.listId)
  const moveCardMutation = useMoveCard({ boardId });
  // -----------------------------
  // Derived memo: lists as array (same as original)
  // -----------------------------
  const data = queryClient.getQueryData<BoardData>(["board", boardId]) ??
    (serverData as BoardData) ?? { lists: {}, cards: {}, listOrder: [] };
  const lists = useMemo(
    () => data.listOrder.map((id) => data.lists[id]),
    [data]
  );

  // -----------------------------
  // Add / rename wrappers (called from UI)
  // -----------------------------
  const addList = useCallback(
    (title: string) => {
      if (!title.trim()) return;
      // compute position: append at end -> max position + 1
      const positions = Object.values(data.lists)
        .map((l) => l.position)
        .sort((a, b) => a - b);
      const pos = positions.length
        ? positions[positions.length - 1] + 1.0
        : 1.0;
      createListMutation.mutate({ title: title.trim(), position: pos });
    },
    [data, createListMutation]
  );

  const renameList = useCallback(
    (listId: string, title: string) => {
      renameListMutation.mutate({ listId, title });
    },
    [renameListMutation]
  );

  const addCard = useCallback(
    (listId: string, title: string) => {
      if (!title.trim()) return;
      const cardPositions =
        data.lists[listId]?.cardIds
          .map((cid) => data.cards[cid]?.position ?? 0)
          .sort((a, b) => a - b) ?? [];
      const pos = cardPositions.length
        ? cardPositions[cardPositions.length - 1] + 1.0
        : 1.0;
      createCardMutation.mutate({ listId, title: title.trim(), position: pos });
    },
    [data, createCardMutation]
  );

  const renameCard = useCallback(
    (cardId: string, title: string) => {
      renameCardMutation.mutate({ cardId, title });
    },
    [renameCardMutation]
  );

  // -----------------------------
  // Drag end uses computePositionBetween on neighbor positions
  // -----------------------------
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId, type } = result;
      if (!destination) return;
      // no-op if same place
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      // Move lists (type COLUMN in your original UI; keep same naming as original ui)
      if (type === "COLUMN" || type === "list") {
        // get current ordered lists and their positions
        const orderedLists = data.listOrder.map((id) => data.lists[id]);
        // destination index
        const destIndex = destination.index;
        const positions = orderedLists
          .map((l) => l.position)
          .sort((a, b) => a - b);
        const newPos = computePositionBetween(positions, destIndex);
        moveListMutation.mutate({ listId: draggableId, position: newPos });
        return;
      }

      // Move cards (type CARD)
      const sourceList = data.lists[source.droppableId];
      const destList = data.lists[destination.droppableId];
      if (!sourceList || !destList) return;

      const movedCardId = draggableId;
      // compute dest list card positions in order
      const destCardPositions = destList.cardIds
        .map((cid) => data.cards[cid]?.position ?? 0)
        .sort((a, b) => a - b);

      // when computing destination index relative to destList.cardIds:
      const destIndex = destination.index;

      const newPos = computePositionBetween(destCardPositions, destIndex);
      moveCardMutation.mutate({
        cardId: movedCardId,
        position: newPos,
        listId: destList.id,
      });
    },
    [data, moveListMutation, moveCardMutation]
  );

  // -----------------------------
  // UI: keep the exact same markup/structure as your original file
  // -----------------------------
  if (isLoading) {
    return <div className="relative">Loading...</div>;
  }

  return (
    <div className="relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              className={cn(
                // Board scroller: horizontal only
                "board-scroll no-scrollbar flex h-[calc(100vh-140px)] items-start gap-3 overflow-x-auto pb-6 pr-3"
              )}
            >
              {/* Column droppable */}
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-start gap-3"
              >
                {lists.map((list, index) => (
                  <Draggable draggableId={list.id} index={index} key={list.id}>
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
                          cards={list.cardIds.map((cid) => data.cards[cid])}
                          onAddCard={(t) => addCard(list.id, t)}
                          onRenameCard={renameCard}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>

              {/* Add list composer OUTSIDE droppable so it stays fixed at the end */}
              <div className="w-[272px] flex-shrink-0">
                {addingList ? (
                  <div className="rounded-md bg-zinc-100/70 p-2 ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                    <Input
                      autoFocus
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addList(newListTitle);
                          setNewListTitle("");
                          setAddingList(false);
                        } else if (e.key === "Escape") {
                          setAddingList(false);
                          setNewListTitle("");
                        }
                      }}
                      placeholder="Enter list title..."
                      className="mb-2 bg-white dark:bg-zinc-900"
                      aria-label="New list title"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          addList(newListTitle);
                          setNewListTitle("");
                          setAddingList(false);
                        }}
                        className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      >
                        Add list
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Cancel add list"
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
                    aria-label="Add another list"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
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

/* -----------------------------
   ListHeader & ListCards
   (kept functionally same as your original file)
   - ListCards expects `cards` array where each card is the Card type above
   - They call onAddCard(listId, title) and onRenameCard(cardId, title)
------------------------------*/
