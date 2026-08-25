"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Trash2, Pencil, Sparkles, ExternalLink, Star } from "lucide-react";
import type { Tables } from "@/types/database.types";
import type { HobbyDetail } from "@/services/hobbies";
import { formatMinutes } from "@/services/hobbies";
import { getHobbyTemplate } from "@/lib/constants/hobby-templates";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HobbyMark } from "@/components/hobbies/hobby-mark";
import { HobbyDialog } from "@/components/hobbies/hobby-dialog";
import { HobbyProjectDialog } from "@/components/hobbies/hobby-project-dialog";
import { HobbyMemoryDialog } from "@/components/hobbies/hobby-memory-dialog";
import { HobbyNoteDialog } from "@/components/hobbies/hobby-note-dialog";
import { HobbyInspirationDialog } from "@/components/hobbies/hobby-inspiration-dialog";
import {
  removeHobby,
  removeHobbyProject,
  removeHobbyMemory,
  removeHobbyNote,
} from "@/server/actions/hobbies";
import { removeInspirationItem } from "@/server/actions/creative";

type HobbyProject = Tables<"hobby_projects">;
type HobbyNote = Tables<"hobby_notes">;

const PROJECT_STATUS_VARIANT: Record<string, "teal" | "default" | "mahogany"> = {
  active: "teal",
  completed: "default",
  abandoned: "mahogany",
};

function EntryFieldChips({
  fields,
  memoryFields,
}: {
  fields: ReturnType<typeof getHobbyTemplate>["fields"];
  memoryFields: Record<string, unknown>;
}) {
  const chips = fields
    .map((def) => ({ def, value: memoryFields[def.key] }))
    .filter(({ value }) => value !== undefined && value !== null && value !== "");

  if (chips.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {chips.map(({ def, value }) => (
        <span
          key={def.key}
          className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-surface-2 px-3 py-1 text-[12px] font-semibold text-ink"
        >
          <span className="text-faint">{def.label}</span>
          {def.type === "rating" ? (
            <span className="inline-flex items-center gap-0.5">
              {Array.from({ length: Number(value) || 0 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber text-amber" />
              ))}
            </span>
          ) : (
            <span>
              {String(value)}
              {def.unit ? ` ${def.unit}` : ""}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export function HobbySheet({
  detail,
  open,
  onOpenChange,
}: {
  detail: HobbyDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const { hobby, projects, memories, notes, inspiration, stats } = detail;
  const template = getHobbyTemplate(hobby.kind);

  const [editHobbyOpen, setEditHobbyOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<HobbyProject | undefined>(undefined);
  const [memoryDialogOpen, setMemoryDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<HobbyNote | undefined>(undefined);
  const [inspirationDialogOpen, setInspirationDialogOpen] = useState(false);

  async function handleDeleteHobby() {
    const ok = await confirm({
      title: `Delete "${hobby.name}"?`,
      description: "This deletes the hobby and everything logged in it. This can't be undone.",
    });
    if (!ok) return;
    await removeHobby(hobby.id);
    toast.success("Hobby deleted");
    onOpenChange(false);
    router.refresh();
  }
  async function handleDeleteProject(id: string, title: string) {
    const ok = await confirm({ title: `Delete "${title}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeHobbyProject(hobby.id, id);
    toast.success("Deleted");
    router.refresh();
  }
  async function handleDeleteMemory(id: string, caption: string) {
    const ok = await confirm({ title: `Delete "${caption}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeHobbyMemory(hobby.id, id);
    toast.success("Deleted");
    router.refresh();
  }
  async function handleDeleteNote(id: string) {
    const ok = await confirm({ title: "Delete this note?", description: "This can't be undone." });
    if (!ok) return;
    await removeHobbyNote(id);
    toast.success("Note deleted");
    router.refresh();
  }
  async function handleDeleteInspiration(id: string, title: string) {
    const ok = await confirm({ title: `Delete "${title}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeInspirationItem(id);
    toast.success("Removed");
    router.refresh();
  }

  function openNewProject() {
    setEditingProject(undefined);
    setProjectDialogOpen(true);
  }
  function openEditProject(project: HobbyProject) {
    setEditingProject(project);
    setProjectDialogOpen(true);
  }
  function openNewNote() {
    setEditingNote(undefined);
    setNoteDialogOpen(true);
  }
  function openEditNote(note: HobbyNote) {
    setEditingNote(note);
    setNoteDialogOpen(true);
  }

  const memoriesWithImages = memories.filter((m) => m.image_url);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          style={{ maxWidth: "min(1080px, 94vw)", width: "100%", padding: 0 }}
          className="overflow-y-auto"
        >
          <div className="relative">
            <div className="h-[220px] w-full bg-surface-2 sm:h-[260px]">
              {hobby.cover_url ? (
                <img src={hobby.cover_url} alt={hobby.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-faint">
                  <Sparkles className="h-8 w-8" />
                </div>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-5 top-16 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-bold text-ink shadow-north-sm transition-transform hover:-translate-y-0.5 hover:border-amber hover:text-amber"
            >
              Back to hobbies
            </button>
          </div>

          <div className="px-6 pb-16 pt-0 sm:px-10">
            <div className="relative -mt-8 flex items-start gap-5">
              <HobbyMark
                id={hobby.id}
                name={hobby.name}
                size="lg"
                className="mt-9 border border-line shadow-north-sm"
              />
              <div className="min-w-0 flex-1 pt-9">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-[36px]">
                    {hobby.name}
                  </h1>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditHobbyOpen(true)}
                      aria-label="Edit hobby"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDeleteHobby} aria-label="Delete hobby">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {hobby.description && (
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                    {hobby.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px]">
                <span className="font-bold text-teal">Goal</span>
                <span className="text-muted">{hobby.goal || "Not set yet"}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-amber-soft px-4 py-2 text-[13px] font-bold text-ink">
                {stats.streakDays > 0 ? `${stats.streakDays}-day streak` : "No streak yet"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-muted">
                {formatMinutes(stats.timeSpentMinutes)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-muted">
                {projects.length > 0
                  ? `${stats.completedProjectPct}% of projects finished`
                  : "No projects yet"}
              </span>
            </div>

            <Progress value={stats.completedProjectPct} className="mt-5" />

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button variant="accent" size="sm" onClick={() => setMemoryDialogOpen(true)}>
                {template.entryVerb}
              </Button>
              <Button variant="secondary" size="sm" onClick={openNewProject}>
                New {template.projectsLabel.toLowerCase().replace(/s$/, "")}
              </Button>
              <Button variant="secondary" size="sm" onClick={openNewNote}>
                Add a note
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setInspirationDialogOpen(true)}>
                Keep inspiration
              </Button>
            </div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">{template.entriesLabel}</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="projects">{template.projectsLabel}</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex flex-col gap-5">
                {stats.latestMemory ? (
                  <Card className="p-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-faint">Latest</div>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-ink">
                      {stats.latestMemory.caption}
                    </p>
                    <div className="mt-2 text-[12.5px] font-semibold text-faint">
                      {format(parseISO(stats.latestMemory.occurred_on), "d MMMM yyyy")}
                    </div>
                    <EntryFieldChips
                      fields={template.fields}
                      memoryFields={(stats.latestMemory.fields ?? {}) as Record<string, unknown>}
                    />
                  </Card>
                ) : (
                  <EmptyState
                    title="Nothing logged yet"
                    description={`${template.entryVerb} to start building this hobby's story.`}
                    action={
                      <Button variant="secondary" size="sm" onClick={() => setMemoryDialogOpen(true)}>
                        {template.entryVerb}
                      </Button>
                    }
                  />
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Card className="p-6">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-faint">
                      {template.projectsLabel}
                    </div>
                    {projects.length === 0 ? (
                      <p className="text-[13.5px] text-muted">No projects started yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {projects.slice(0, 4).map((p) => (
                          <div key={p.id} className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13.5px] font-semibold text-ink">
                              {p.title}
                            </span>
                            <Badge variant={PROJECT_STATUS_VARIANT[p.status] ?? "default"}>
                              {p.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                  <Card className="p-6">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-faint">
                      Latest note
                    </div>
                    {notes.length === 0 ? (
                      <p className="text-[13.5px] text-muted">No notes yet.</p>
                    ) : (
                      <p className="line-clamp-4 text-[13.5px] leading-relaxed text-ink">
                        {notes[0].body}
                      </p>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                {memories.length === 0 ? (
                  <EmptyState
                    title="Nothing logged yet"
                    description={`${template.entryVerb} to start this hobby's log.`}
                    action={
                      <Button variant="secondary" size="sm" onClick={() => setMemoryDialogOpen(true)}>
                        {template.entryVerb}
                      </Button>
                    }
                  />
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute bottom-1.5 left-[3px] top-1.5 w-px bg-line" />
                    <div className="flex flex-col gap-6">
                      {memories.map((m) => (
                        <div key={m.id} className="relative">
                          <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-teal" />
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[14.5px] font-semibold leading-relaxed text-ink">
                                {m.caption}
                              </p>
                              <div className="mt-1 text-[12.5px] font-semibold text-faint">
                                {format(parseISO(m.occurred_on), "d MMMM yyyy")}
                                {m.duration_minutes ? ` · ${m.duration_minutes} min` : ""}
                              </div>
                              <EntryFieldChips
                                fields={template.fields}
                                memoryFields={(m.fields ?? {}) as Record<string, unknown>}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMemory(m.id, m.caption)}
                              aria-label="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gallery">
                {memoriesWithImages.length === 0 ? (
                  <EmptyState
                    title="No photos yet"
                    description="Moments logged with an image will show up here."
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {memoriesWithImages.map((m) => (
                      <div
                        key={m.id}
                        className="group relative aspect-square overflow-hidden rounded-[14px] bg-surface-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.image_url!} alt={m.caption} className="h-full w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="line-clamp-2 text-[12px] font-semibold text-bg">{m.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects" className="flex flex-col gap-3">
                {projects.length === 0 ? (
                  <EmptyState
                    title={`No ${template.projectsLabel.toLowerCase()} yet`}
                    description="Track the things you're building or working on within this hobby."
                    action={
                      <Button variant="secondary" size="sm" onClick={openNewProject}>
                        New {template.projectsLabel.toLowerCase().replace(/s$/, "")}
                      </Button>
                    }
                  />
                ) : (
                  projects.map((project) => (
                    <Card key={project.id} className="flex flex-col gap-2 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-ink">{project.title}</h3>
                            <Badge variant={PROJECT_STATUS_VARIANT[project.status] ?? "default"}>
                              {project.status}
                            </Badge>
                          </div>
                          {project.notes && (
                            <p className="text-[13px] leading-relaxed text-muted">{project.notes}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProject(project)}
                            aria-label="Edit project"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            aria-label="Delete project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="notes" className="flex flex-col gap-3">
                {notes.length === 0 ? (
                  <EmptyState
                    title="No notes yet"
                    description="Jot down anything worth remembering about this hobby."
                    action={
                      <Button variant="secondary" size="sm" onClick={openNewNote}>
                        Add a note
                      </Button>
                    }
                  />
                ) : (
                  notes.map((note) => (
                    <Card key={note.id} className="flex items-start justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
                          {note.body}
                        </p>
                        <div className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-faint">
                          {format(parseISO(note.created_at), "d MMMM yyyy")}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditNote(note)}
                          aria-label="Edit note"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="inspiration">
                {inspiration.length === 0 ? (
                  <EmptyState
                    title="Nothing kept yet"
                    description="Save a reference, photo, or link that belongs to this hobby."
                    action={
                      <Button variant="secondary" size="sm" onClick={() => setInspirationDialogOpen(true)}>
                        Keep inspiration
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {inspiration.map((item) => (
                      <Card key={item.id} className="flex flex-col overflow-hidden">
                        <div className="aspect-video w-full bg-surface-2">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-faint">
                              <Sparkles className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5 p-4">
                          {item.kind && (
                            <span className="w-fit text-[11px] font-bold uppercase tracking-wider text-teal">
                              {item.kind}
                            </span>
                          )}
                          <h3 className="text-[14.5px] font-bold text-ink">{item.title}</h3>
                          {item.note && (
                            <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted">
                              {item.note}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            {item.source_url ? (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-teal hover:underline"
                              >
                                Source <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteInspiration(item.id, item.title)}
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <HobbyDialog open={editHobbyOpen} onOpenChange={setEditHobbyOpen} hobby={hobby} />
      <HobbyProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        hobbyId={hobby.id}
        project={editingProject}
      />
      <HobbyMemoryDialog
        open={memoryDialogOpen}
        onOpenChange={setMemoryDialogOpen}
        hobbyId={hobby.id}
        hobbyName={hobby.name}
        kind={hobby.kind}
      />
      <HobbyNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        hobbyId={hobby.id}
        note={editingNote}
      />
      <HobbyInspirationDialog
        open={inspirationDialogOpen}
        onOpenChange={setInspirationDialogOpen}
        hobbyId={hobby.id}
      />
    </>
  );
}
