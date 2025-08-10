import { useEffect, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

export function ListCards({
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

  useEffect(() => {
    if (adding) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [adding]);

  useEffect(() => {
    if (adding) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [cards.length, adding]);

  function handleConfirmAdd() {
    if (text.trim()) {
      onAddCard(text);
      setText("");
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }

  return (
    // Droppable remains non-scrollable; only inner list scrolls to avoid nested scroll warnings
    <Droppable droppableId={listId} type="CARD">
      {(provided, snapshot) => {
        const showPlaceholder = snapshot.isDraggingOver;

        return (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex min-h-0 flex-1 flex-col pr-1"
            aria-label={`Cards in list ${listId}`}
          >
            {/* Scrollable cards area */}
            <div
              ref={scrollRef}
              className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto")}
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

                {/* Placeholder stays with cards so it affects drop position; source list shrinks when not dragging over */}
                {showPlaceholder && provided.placeholder}
                {adding && (
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
                )}
              </div>
            </div>

            {/* Fixed footer: Add composer/button is always visible and not scrollable */}
            <div className="mt-2">
              {!adding && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setAdding(true);
                    requestAnimationFrame(() => scrollToBottom(true));
                  }}
                  className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-zinc-600 transition hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                  aria-label="Add a card"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add a card</span>
                </button>
              )}
            </div>
            {/* {provided.placeholder} */}
          </div>
        );
      }}
    </Droppable>
  );
}
