"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Tables } from "@/types/database.types";
import type { BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mark } from "@/components/ui/mark";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteDialog } from "@/components/notes/note-dialog";
import { removeNote } from "@/server/actions/notes";
import { cn } from "@/lib/utils";

type Note = Tables<"notes">;
type View = "grid" | "list";

const TAG_TONES = ["teal", "amber", "mahogany"] as const;
type TagTone = (typeof TAG_TONES)[number];

function tagTone(tag: string): TagTone {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_TONES[hash % TAG_TONES.length];
}

function truncate(text: string, max = 140) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors",
        active
          ? "border-ink bg-ink text-bg"
          : "border-line bg-surface-2 text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function NoteCard({
  note,
  view,
  onEdit,
  onDelete,
}: {
  note: Note;
  view: View;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const category = note.tags[0];
  const tone = category ? tagTone(category) : null;
  const isList = view === "list";

  return (
    <Card
      className={cn(
        "flex flex-col gap-3.5 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-north-md",
        isList && "sm:flex-row sm:items-start sm:gap-6",
      )}
    >
      <div className={cn("flex flex-col gap-3", isList && "min-w-0 sm:flex-1")}>
        <div className="flex items-center gap-2">
          <Mark tone={tone ?? "muted"} size={7} />
          <Badge variant={(tone ?? "default") as BadgeProps["variant"]}>
            {category ?? "General"}
          </Badge>
        </div>
        <div>
          <h3 className="text-[17.5px] font-extrabold text-ink">{note.title}</h3>
          {note.body && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              {truncate(note.body)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-bold text-faint">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line-2 bg-surface-2 px-2.5 py-1 text-[11.5px] font-bold text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={cn("flex gap-3.5", isList && "shrink-0 sm:pt-1")}>
        <button
          type="button"
          onClick={() => onEdit(note)}
          className="text-[12px] font-bold text-faint transition-colors hover:text-teal"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(note.id)}
          className="text-[12px] font-bold text-faint transition-colors hover:text-mahogany"
        >
          Delete
        </button>
      </div>
    </Card>
  );
}

export function NotesClient({ notes, autoOpen }: { notes: Note[]; autoOpen: boolean }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(autoOpen);
  const [editing, setEditing] = useState<Note | undefined>(undefined);
  const [view, setView] = useState<View>("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filtered = selectedTag ? notes.filter((n) => n.tags.includes(selectedTag)) : notes;
  const pinned = filtered.filter((n) => n.pinned);
  const recent = filtered.filter((n) => !n.pinned);

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

  const gridClass =
    view === "grid"
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      : "flex flex-col gap-3";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Notes</h1>
          <p className="mt-2 text-[17px] text-muted">
            {notes.length} note{notes.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1 rounded-full border border-line bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                view === "grid" ? "bg-raise text-ink shadow-north-sm" : "text-muted hover:text-ink",
              )}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                view === "list" ? "bg-raise text-ink shadow-north-sm" : "text-muted hover:text-ink",
              )}
            >
              List
            </button>
          </div>
          <Button variant="accent" onClick={openNew}>
            New note
          </Button>
        </div>
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
        <>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <ChipButton active={selectedTag === null} onClick={() => setSelectedTag(null)}>
                All
              </ChipButton>
              {allTags.map((tag) => (
                <ChipButton
                  key={tag}
                  active={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </ChipButton>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              title={`No notes tagged "${selectedTag}"`}
              description="Try a different tag, or clear the filter to see everything."
              action={
                <Button variant="outline" onClick={() => setSelectedTag(null)}>
                  Clear filter
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-9">
              {pinned.length > 0 && (
                <div>
                  <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                    Pinned
                  </div>
                  <div className={gridClass}>
                    {pinned.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        view={view}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
              {recent.length > 0 && (
                <div>
                  <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">
                    Recent
                  </div>
                  <div className={gridClass}>
                    {recent.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        view={view}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <NoteDialog open={dialogOpen} onOpenChange={setDialogOpen} note={editing} />
    </div>
  );
}
