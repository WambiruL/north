"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Sparkles, ImageOff } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyDialog } from "@/components/hobbies/hobby-dialog";
import { HobbyProjectDialog } from "@/components/hobbies/hobby-project-dialog";
import { HobbyMemoryDialog } from "@/components/hobbies/hobby-memory-dialog";
import { removeHobby, removeHobbyProject, removeHobbyMemory } from "@/server/actions/hobbies";

type Hobby = Tables<"hobbies">;
type HobbyProject = Tables<"hobby_projects">;
type HobbyMemory = Tables<"hobby_memories">;

const PROJECT_STATUS_VARIANT: Record<string, "teal" | "default" | "mahogany"> = {
  active: "teal",
  completed: "default",
  abandoned: "mahogany",
};

export function HobbyDetailClient({
  hobby,
  projects,
  memories,
}: {
  hobby: Hobby;
  projects: HobbyProject[];
  memories: HobbyMemory[];
}) {
  const [editHobbyOpen, setEditHobbyOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<HobbyProject | undefined>(undefined);
  const [memoryDialogOpen, setMemoryDialogOpen] = useState(false);

  async function handleDeleteHobby() {
    await removeHobby(hobby.id);
    toast.success("Hobby deleted");
  }

  async function handleDeleteProject(id: string) {
    await removeHobbyProject(hobby.id, id);
    toast.success("Project deleted");
  }

  async function handleDeleteMemory(id: string) {
    await removeHobbyMemory(hobby.id, id);
    toast.success("Memory deleted");
  }

  function openNewProject() {
    setEditingProject(undefined);
    setProjectDialogOpen(true);
  }

  function openEditProject(project: HobbyProject) {
    setEditingProject(project);
    setProjectDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/hobbies"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All hobbies
      </Link>

      <Card className="overflow-hidden">
        <div className="aspect-[21/9] w-full bg-surface-2">
          {hobby.cover_url ? (
            <img src={hobby.cover_url} alt={hobby.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-faint">
              <Sparkles className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <h1 className="text-[30px] font-bold tracking-tight text-ink">{hobby.name}</h1>
            {hobby.description && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
                {hobby.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditHobbyOpen(true)}
              aria-label="Edit hobby"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteHobby}
              aria-label="Delete hobby"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">Projects</h2>
          <Button variant="secondary" size="sm" onClick={openNewProject}>
            New project
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Track the things you're building or working on within this hobby."
            action={
              <Button variant="secondary" size="sm" onClick={openNewProject}>
                Add a project
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((project) => (
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
                      onClick={() => handleDeleteProject(project.id)}
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">Memories</h2>
          <Button variant="secondary" size="sm" onClick={() => setMemoryDialogOpen(true)}>
            Add memory
          </Button>
        </div>

        {memories.length === 0 ? (
          <EmptyState
            title="No memories yet"
            description="Capture a moment from this hobby — a photo, a milestone, a little win."
            action={
              <Button variant="secondary" size="sm" onClick={() => setMemoryDialogOpen(true)}>
                Add your first memory
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {memories.map((memory) => (
              <Card key={memory.id} className="flex gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-surface-2">
                  {memory.image_url ? (
                    <img
                      src={memory.image_url}
                      alt={memory.caption}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-1 py-0.5">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wider text-faint">
                      {format(parseISO(memory.occurred_on), "d MMMM yyyy")}
                    </div>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{memory.caption}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 self-start"
                  onClick={() => handleDeleteMemory(memory.id)}
                  aria-label="Delete memory"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

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
      />
    </div>
  );
}
