"use client";

import { useCallback, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardData, List } from "@/types";
import { cn } from "@/lib/utils";

import { ListHeader } from "./list-header";
import { getDraggableStyle, ListCards } from "./list-cards";
import { useBoard } from "@/features/boards/hooks/useBoard";
import { useCreateList } from "@/features/lists/hooks/useCreateList";
import { useUpdateList } from "@/features/lists/hooks/useUpdateList";

export default function KanbanBoard({ boardId }: { boardId: string }) {
  const { data, isLoading } = useBoard(boardId);

  const { mutateAsync: createList } = useCreateList(boardId);
  const { mutateAsync: updateList } = useUpdateList(boardId);

  const board = data as BoardData;

  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const listInputRef = useRef<HTMLInputElement | null>(null);

  const addList = async (title: string) => {
    if (!title.trim()) return;
    const maxPos = Math.max(0, ...data.lists.map((l: List) => l.position));
    await createList({ title, position: maxPos + 1 });
  };

  // === Add card ===
  const addCard = useCallback(
    (listId: string, title: string, position: number) => {
      if (!title.trim()) return;
    },
    []
  );

  // === Rename list ===
  const renameList = async (listId: string, title: string) => {
    if (!title.trim()) return;
    await updateList({ listId, title });
  };

  // === Rename card ===
  const renameCard = useCallback((cardId: string, title: string) => {}, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;

    // If nothing changed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Moving a LIST
    if (type === "LIST") {
      const lists = board.lists;
      const movedList = lists[source.index];

      let newPosition: number;

      if (destination.index === 0) {
        // Move to start
        newPosition = lists[0].position - 1;
      } else if (destination.index === lists.length - 1) {
        // Move to end
        newPosition = lists[lists.length - 1].position + 1;
      } else {
        const before = lists[destination.index - 1];
        const after = lists[destination.index];
        newPosition = (before.position + after.position) / 2;
      }
      await updateList({
        listId: movedList.id,
        position: newPosition,
      });
      return;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
                {board.lists
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((list, index) => {
                    const listCards = board.cards
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
