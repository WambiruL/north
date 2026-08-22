"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { NotebookPen } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/work/shared";
import { WorkNoteDialog } from "@/components/work/work-note-dialog";
import { removeWorkNote } from "@/server/actions/work";

type WorkNote = Tables<"work_notes"> & { work_project: { id: string; name: string } | null };
type ProjectOption = { id: string; name: string };

export function NotesTab({ notes, projects }: { notes: WorkNote[]; projects: ProjectOption[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkNote | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(note: WorkNote) {
    setEditing(note);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeWorkNote(id);
    toast.success("Note removed");
    router.refresh();
  }

  if (notes.length === 0) {
    return (
      <>
        <EmptyState
          icon={<NotebookPen className="h-8 w-8" />}
          title="No notes yet"
          description="Write down what came out of a call or meeting."
          action={
            <Button variant="accent" onClick={openNew}>
              Write a note
            </Button>
          }
        />
        <WorkNoteDialog open={dialogOpen} onOpenChange={setDialogOpen} note={editing} projects={projects} />
      </>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {notes.map((note) => (
        <div key={note.id} className="rounded-[18px] border border-line bg-surface p-8 shadow-north-sm">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-faint">
              {format(parseISO(note.occurred_on), "d MMMM")}
            </span>
            {note.work_project && (
              <span className="rounded-full bg-teal-soft px-2.5 py-1 text-[11.5px] font-bold text-teal">
                {note.work_project.name}
              </span>
            )}
          </div>
          <h3 className="mb-1.5 text-[21px] font-bold text-ink">{note.title}</h3>
          {note.met_with && <div className="mb-4 text-[13.5px] text-muted">With {note.met_with}</div>}
          <p className="whitespace-pre-wrap text-[15.5px] leading-relaxed text-muted">{note.body}</p>
          <RowActions onEdit={() => openEdit(note)} onDelete={() => handleDelete(note.id)} />
        </div>
      ))}
      <AddRowButton onClick={openNew}>Write a note</AddRowButton>

      <WorkNoteDialog open={dialogOpen} onOpenChange={setDialogOpen} note={editing} projects={projects} />
    </div>
  );
}
