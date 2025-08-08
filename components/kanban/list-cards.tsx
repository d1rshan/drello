import { cn } from "@/lib/utils";
import { Card } from "./kanban-board";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { getDraggableStyle } from "./kanban-board";

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
