"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Pin } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteDialog } from "@/components/notes/note-dialog";
import { removeNote, setPinned } from "@/server/actions/notes";

type Note = Tables<"notes">;

function truncate(text: string, max = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-bold text-ink">{note.title}</h3>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTogglePin(note)}
            aria-label={note.pinned ? "Unpin" : "Pin"}
          >
            <Pin className={note.pinned ? "h-3.5 w-3.5 fill-amber text-amber" : "h-3.5 w-3.5"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(note)} aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)} aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {note.body && (
        <p className="text-[13.5px] leading-relaxed text-muted">{truncate(note.body)}</p>
      )}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

export function NotesClient({ notes, autoOpen }: { notes: Note[]; autoOpen: boolean }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(autoOpen);
  const [editing, setEditing] = useState<Note | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeNote(id);
    toast.success("Note deleted");
    router.refresh();
  }

  async function handlePinToggle(note: Note) {
    await setPinned(note.id, !note.pinned);
    router.refresh();
  }

  const pinned = notes.filter((n) => n.pinned);
  const rest = notes.filter((n) => !n.pinned);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Notes</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            Quick thoughts, captured before they slip away.
          </p>
        </div>
        <Button variant="accent" onClick={openNew}>
          New note
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Capture a first thought — an idea, a line worth remembering, anything at all."
          action={
            <Button variant="accent" onClick={openNew}>
              Write a note
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {pinned.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[12.5px] font-semibold uppercase tracking-wider text-faint">
                Pinned
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pinned.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onTogglePin={handlePinToggle}
                  />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="flex flex-col gap-3">
              {pinned.length > 0 && (
                <h2 className="text-[12.5px] font-semibold uppercase tracking-wider text-faint">
                  All notes
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onTogglePin={handlePinToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <NoteDialog open={dialogOpen} onOpenChange={setDialogOpen} note={editing} />
    </div>
  );
}
