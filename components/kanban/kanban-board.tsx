"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, GripVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple ID generator to avoid extra deps
function uid(prefix = "id") {
  return `${prefix}_${Math.random()
    .toString(36)
    .slice(2, 8)}_${Date.now().toString(36)}`;
}

function getDraggableStyle(
  style: any,
  snapshot: { isDragging: boolean; isDropAnimating: boolean }
) {
  if (!style) return style;
  // Make drop instant/snappy (near-zero duration), and keep smooth while dragging
  if (snapshot.isDropAnimating) {
    return { ...style, transitionDuration: "0.005s" };
  }
  if (snapshot.isDragging) {
    return { ...style, willChange: "transform" };
  }
  return style;
}

type Card = {
  id: string;
  title: string;
  description?: string;
};

type List = {
  id: string;
  title: string;
  cardIds: string[];
};

type BoardData = {
  lists: Record<string, List>;
  cards: Record<string, Card>;
  listOrder: string[];
};

const MOCK_DATA: BoardData = {
  lists: {
    "list-1": {
      id: "list-1",
      title: "To do",
      cardIds: ["card-1", "card-2", "card-3"],
    },
    "list-2": {
      id: "list-2",
      title: "In progress",
      cardIds: ["card-4", "card-5"],
    },
    "list-3": { id: "list-3", title: "Done", cardIds: ["card-6"] },
  },
  cards: {
    "card-1": { id: "card-1", title: "Design login screen" },
    "card-2": { id: "card-2", title: "Set up CI workflow" },
    "card-3": { id: "card-3", title: "Write README" },
    "card-4": { id: "card-4", title: "Build auth provider" },
    "card-5": { id: "card-5", title: "Integrate payment" },
    "card-6": { id: "card-6", title: "Ship v0.1.0" },
  },
  listOrder: ["list-1", "list-2", "list-3"],
};

const STORAGE_KEY = "v0_trello_board_mock";

export default function KanbanBoard({
  initialData,
}: { initialData?: BoardData } = {}) {
  const [data, setData] = useState<BoardData>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as BoardData;
        } catch {
          // fall through
        }
      }
    }
    return initialData ?? structuredClone(MOCK_DATA);
  });

  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const lists = useMemo(
    () => data.listOrder.map((id) => data.lists[id]),
    [data]
  );

  const addList = useCallback((title: string) => {
    if (!title.trim()) return;
    const id = uid("list");
    setData((prev) => {
      const next: BoardData = {
        ...prev,
        lists: {
          ...prev.lists,
          [id]: { id, title: title.trim(), cardIds: [] },
        },
        listOrder: [...prev.listOrder, id],
      };
      return next;
    });
  }, []);

  const addCard = useCallback((listId: string, title: string) => {
    if (!title.trim()) return;
    const id = uid("card");
    setData((prev) => {
      const next: BoardData = {
        ...prev,
        cards: { ...prev.cards, [id]: { id, title: title.trim() } },
        lists: {
          ...prev.lists,
          [listId]: {
            ...prev.lists[listId],
            cardIds: [...prev.lists[listId].cardIds, id],
          },
        },
      };
      return next;
    });
  }, []);

  const renameList = useCallback((listId: string, title: string) => {
    setData((prev) => ({
      ...prev,
      lists: {
        ...prev.lists,
        [listId]: {
          ...prev.lists[listId],
          title: title || prev.lists[listId].title,
        },
      },
    }));
  }, []);

  const renameCard = useCallback((cardId: string, title: string) => {
    setData((prev) => ({
      ...prev,
      cards: { ...prev.cards, [cardId]: { ...prev.cards[cardId], title } },
    }));
  }, []);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId, type } = result;

      if (!destination) return;

      // No movement
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // Reorder columns
      if (type === "COLUMN") {
        const newOrder = Array.from(data.listOrder);
        newOrder.splice(source.index, 1);
        newOrder.splice(destination.index, 0, draggableId);
        setData((prev) => ({ ...prev, listOrder: newOrder }));
        return;
      }

      // Move cards
      const startList = data.lists[source.droppableId];
      const finishList = data.lists[destination.droppableId];

      // Same list reorder
      if (startList === finishList) {
        const newCardIds = Array.from(startList.cardIds);
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);

        const newList: List = { ...startList, cardIds: newCardIds };
        setData((prev) => ({
          ...prev,
          lists: { ...prev.lists, [newList.id]: newList },
        }));
        return;
      }

      // Moving across lists
      const startCardIds = Array.from(startList.cardIds);
      startCardIds.splice(source.index, 1);
      const newStart: List = { ...startList, cardIds: startCardIds };

      const finishCardIds = Array.from(finishList.cardIds);
      finishCardIds.splice(destination.index, 0, draggableId);
      const newFinish: List = { ...finishList, cardIds: finishCardIds };

      setData((prev) => ({
        ...prev,
        lists: {
          ...prev.lists,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      }));
    },
    [data]
  );

  return (
    <div className="relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                // Board scroller: horizontal only
                "board-scroll no-scrollbar flex h-[calc(100vh-140px)] gap-3 overflow-x-auto pb-6 pr-3"
              )}
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
                        // Fixed width and full height column
                        "flex h-full min-h-0 flex-col w-[272px] min-w-[272px] max-w-[272px] basis-[272px] flex-shrink-0",
                        // Visuals (neutral, no green)
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

              {/* Add list composer */}
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
                        // Black in light, White in dark
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

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Scoped styles */}
      <style jsx global>{`
        /* Hide scrollbars for elements using .no-scrollbar */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Safari/Chrome */
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}

function ListHeader({
  title = "List",
  onRename = () => {},
  dragHandleProps,
}: {
  title?: string;
  onRename?: (title: string) => void;
  dragHandleProps?: any;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);

  useEffect(() => setVal(title), [title]);

  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2">
        <button
          className="cursor-grab text-zinc-400 hover:text-zinc-500"
          aria-label="Drag list"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {editing ? (
          <Input
            value={val}
            autoFocus
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => {
              onRename(val.trim() || title);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(val.trim() || title);
                setEditing(false);
              } else if (e.key === "Escape") {
                setVal(title);
                setEditing(false);
              }
            }}
            // Natural, unobtrusive size to match label
            className={cn(
              "h-7 w-full bg-white dark:bg-zinc-900",
              "px-1 py-0 text-sm leading-none",
              "border border-zinc-300 dark:border-zinc-700",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            aria-label="List title"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="line-clamp-1 cursor-text rounded px-1 text-sm font-medium text-zinc-800 hover:bg-white/60 dark:text-zinc-100 dark:hover:bg-white/5"
            aria-label="Edit list title"
            title="Click to rename"
          >
            {title}
          </button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-zinc-500"
        aria-label="List menu"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ListCards({
  listId = "list-0",
  cards = [],
  onAddCard = () => {},
  onRenameCard = () => {},
}: {
  listId?: string;
  cards?: Card[];
  onAddCard?: (title: string) => void;
  onRenameCard?: (cardId: string, title: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  function startEdit(card: Card) {
    setEditingId(card.id);
    setEditingText(card.title);
    // Close the add composer to avoid overlap while editing
    setAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function saveEdit() {
    if (editingId && editingText.trim()) {
      onRenameCard(editingId, editingText.trim());
    }
    cancelEdit();
  }

  const scrollRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom(smooth = true) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }

  // When opening the composer, ensure it's visible
  useEffect(() => {
    if (adding) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [adding]);

  // When a new card is added while composer is open, keep scrolled to the end
  useEffect(() => {
    if (adding) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [cards.length, adding]);

  function handleConfirmAdd() {
    if (text.trim()) {
      onAddCard(text);
      setText("");
      // Wait for DOM to update, then scroll to bottom
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }

  return (
    // Keep Droppable non-scrollable to avoid nested scroll warning
    <Droppable droppableId={listId} type="CARD">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex flex-1 min-h-0 flex-col pr-1"
          aria-label={`Cards in list ${listId}`}
        >
          {/* Inner scroll area fills remaining height of column */}
          <div
            className={cn("no-scrollbar flex-1 min-h-0 overflow-y-auto")}
            ref={scrollRef}
          >
            <div
              className={cn(
                "flex flex-col gap-2",
                snapshot.isDraggingOver &&
                  "rounded-md bg-black/5 p-1 dark:bg-white/10"
              )}
            >
              {cards.map((card, index) => (
                <Draggable draggableId={card.id} index={index} key={card.id}>
                  {(dragProvided, dragSnapshot) => {
                    const isEditing = editingId === card.id;
                    return (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        style={getDraggableStyle(
                          dragProvided.draggableProps.style,
                          dragSnapshot
                        )}
                        className={cn(
                          "rounded-md border border-zinc-200 bg-white text-sm text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-900/80",
                          dragSnapshot.isDragging &&
                            "border-black/40 dark:border-white/50"
                        )}
                        onDoubleClick={() => startEdit(card)}
                      >
                        {isEditing ? (
                          <div className="p-2">
                            <Textarea
                              value={editingText}
                              autoFocus
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (editingText.trim()) saveEdit();
                                } else if (e.key === "Escape") {
                                  cancelEdit();
                                }
                              }}
                              placeholder="Edit card title..."
                              className="mb-2 min-h-[64px] resize-none bg-white dark:bg-zinc-900"
                              aria-label="Edit card title"
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={saveEdit}
                                className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Discard edit"
                                onClick={cancelEdit}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="min-h-[36px] whitespace-pre-wrap p-2">
                            {card.title}
                          </div>
                        )}
                      </div>
                    );
                  }}
                </Draggable>
              ))}

              {provided.placeholder}

              {/* Composer or Add button stays at the end of the list INSIDE the scroll area */}
              {adding ? (
                <div className="rounded-md bg-white p-2 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <Textarea
                    value={text}
                    autoFocus
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleConfirmAdd();
                      } else if (e.key === "Escape") {
                        setAdding(false);
                        setText("");
                      }
                    }}
                    placeholder="Enter a title for this card..."
                    className="mb-2 min-h-[64px] resize-none bg-white dark:bg-zinc-900"
                    aria-label="New card title"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleConfirmAdd}
                      className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      Add card
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Cancel add card"
                      onClick={() => {
                        setAdding(false);
                        setText("");
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setAdding(true);
                    // Make sure the composer is visible right away
                    requestAnimationFrame(() => scrollToBottom(true));
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-zinc-600 transition hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                  aria-label="Add a card"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add a card</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );
}
