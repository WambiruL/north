"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Plus, Sparkles, Star, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import type { HobbyDetail } from "@/services/hobbies";
import { computeCurrentActivity, formatMinutes } from "@/services/hobbies";
import type { HobbyTemplate } from "@/lib/constants/hobby-templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { HobbyMemoryDialog } from "@/components/hobbies/hobby-memory-dialog";
import { HobbyProjectDialog } from "@/components/hobbies/hobby-project-dialog";
import { HobbyNoteDialog } from "@/components/hobbies/hobby-note-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeHobbyMemory, removeHobbyProject, removeHobbyNote } from "@/server/actions/hobbies";

type Hobby = Tables<"hobbies">;
type HobbyProject = Tables<"hobby_projects">;
type HobbyMemory = Tables<"hobby_memories">;
type HobbyNote = Tables<"hobby_notes">;

const PROJECT_STATUS_VARIANT: Record<string, "teal" | "default" | "mahogany"> = {
  active: "teal",
  completed: "default",
  abandoned: "mahogany",
};

export function FlexibleHobbyPage({
  hobby,
  template,
  detail,
}: {
  hobby: Hobby;
  template: HobbyTemplate;
  detail: HobbyDetail;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<HobbyProject | undefined>(undefined);
  const [noteOpen, setNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<HobbyNote | undefined>(undefined);

  const current = computeCurrentActivity(template, detail.memories);
  const activeProjects = detail.projects.filter((p) => p.status === "active");

  async function handleDeleteMemory(id: string) {
    const ok = await confirm({ title: "Delete this entry?", description: "This can't be undone." });
    if (!ok) return;
    await removeHobbyMemory(hobby.id, id);
    toast.success("Removed");
    router.refresh();
  }

  async function handleDeleteProject(id: string) {
    const ok = await confirm({ title: "Delete this project?", description: "This can't be undone." });
    if (!ok) return;
    await removeHobbyProject(hobby.id, id);
    toast.success("Removed");
    router.refresh();
  }

  async function handleDeleteNote(id: string) {
    const ok = await confirm({ title: "Delete this note?", description: "This can't be undone." });
    if (!ok) return;
    await removeHobbyNote(id);
    toast.success("Removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobby.name}
        description={hobby.description}
        action={
          <Button variant="accent" onClick={() => setMemoryOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> {template.entryVerb}
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">{template.currentLabel}</h2>
        {current ? (
          <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
            {current.sub && <div className="mb-1.5 text-[11.5px] font-bold text-faint">{current.sub}</div>}
            <div className="text-[19px] font-bold leading-snug text-ink">{current.title}</div>
            {detail.memories[0] && (
              <div className="mt-2 text-[12px] text-faint">
                {format(parseISO(detail.memories[0].occurred_on), "d MMMM")}
                {detail.memories[0].duration_minutes ? ` · ${formatMinutes(detail.memories[0].duration_minutes)}` : ""}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title={`Nothing logged yet.`}
            description={`${template.entryVerb} to see it show up here.`}
            action={
              <Button variant="accent" onClick={() => setMemoryOpen(true)}>
                {template.entryVerb}
              </Button>
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">{template.projectsLabel}</h2>
          <button
            onClick={() => {
              setEditingProject(undefined);
              setProjectOpen(true);
            }}
            className="text-[12px] font-bold text-teal hover:text-amber"
          >
            + Add
          </button>
        </div>
        {activeProjects.length === 0 ? (
          <p className="text-[13px] text-faint">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-bold text-ink">{project.title}</span>
                  <Badge variant={PROJECT_STATUS_VARIANT[project.status] ?? "default"}>{project.status}</Badge>
                </div>
                {project.notes && <p className="text-[12.5px] text-muted">{project.notes}</p>}
                <div className="mt-1 flex gap-3">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setProjectOpen(true);
                    }}
                    className="text-[11.5px] font-bold text-faint hover:text-teal"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteProject(project.id)} className="text-[11.5px] font-bold text-faint hover:text-mahogany">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">{template.entriesLabel}</h2>
        {detail.memories.length === 0 ? (
          <p className="text-[13px] text-faint">Nothing logged yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {detail.memories.map((memory) => (
              <MemoryRow key={memory.id} memory={memory} onDelete={() => handleDeleteMemory(memory.id)} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Notes</h2>
          <button
            onClick={() => {
              setEditingNote(undefined);
              setNoteOpen(true);
            }}
            className="text-[12px] font-bold text-teal hover:text-amber"
          >
            + Add
          </button>
        </div>
        {detail.notes.length === 0 ? (
          <p className="text-[13px] text-faint">Nothing here yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {detail.notes.map((note) => (
              <div key={note.id} className="rounded-[14px] border border-line bg-surface p-4">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">{note.body}</p>
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setEditingNote(note);
                      setNoteOpen(true);
                    }}
                    className="text-[11.5px] font-bold text-faint hover:text-teal"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-[11.5px] font-bold text-faint hover:text-mahogany">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HobbyMemoryDialog open={memoryOpen} onOpenChange={setMemoryOpen} hobbyId={hobby.id} hobbyName={hobby.name} kind={hobby.kind} />
      <HobbyProjectDialog open={projectOpen} onOpenChange={setProjectOpen} hobbyId={hobby.id} project={editingProject} />
      <HobbyNoteDialog open={noteOpen} onOpenChange={setNoteOpen} hobbyId={hobby.id} note={editingNote} />
    </div>
  );
}

function MemoryRow({ memory, onDelete }: { memory: HobbyMemory; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-3.5 rounded-[13px] px-2.5 py-3 transition-colors hover:bg-surface-2">
      {memory.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={memory.image_url} alt="" className="h-12 w-12 shrink-0 rounded-[8px] object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-surface-2 text-faint">
          <Star className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold text-ink">{memory.caption}</div>
        <div className="mt-0.5 text-[11.5px] text-faint">
          {format(parseISO(memory.occurred_on), "d MMM yyyy")}
          {memory.duration_minutes ? ` · ${formatMinutes(memory.duration_minutes)}` : ""}
        </div>
      </div>
      <button onClick={onDelete} aria-label="Delete entry" className="shrink-0 pt-0.5 text-faint hover:text-mahogany">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
