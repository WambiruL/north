"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton } from "@/components/work/shared";
import { ProjectDialog } from "@/components/work/project-dialog";
import { removeProject } from "@/server/actions/work";

type Project = Tables<"work_projects"> & {
  client: { id: string; name: string } | null;
  taskCounts: { done: number; total: number };
};
type ClientOption = { id: string; name: string };

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_TONE: Record<string, "teal" | "amber" | "default" | "mahogany"> = {
  active: "teal",
  on_hold: "amber",
  completed: "default",
  archived: "mahogany",
};

export function ProjectsTab({ projects, clients }: { projects: Project[]; clients: ClientOption[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeProject(id);
    toast.success("Project deleted");
    router.refresh();
  }

  if (projects.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title="No projects yet"
          description="Start a project to begin tracking tasks and related spending."
          action={
            <Button variant="accent" onClick={openNew}>
              Start a project
            </Button>
          }
        />
        <ProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          project={editing}
          clients={clients}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {projects.map((project) => {
          const { done, total } = project.taskCounts;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div
              key={project.id}
              className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-surface shadow-north-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-north-md"
            >
              <Link href={`/work/${project.id}`} className="block px-6 pb-2 pt-6">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <Badge variant={STATUS_TONE[project.status] ?? "default"}>
                    {STATUS_LABELS[project.status] ?? project.status}
                  </Badge>
                  {project.client && (
                    <span className="text-[12.5px] font-bold text-faint">{project.client.name}</span>
                  )}
                </div>
                <div className="mb-2 text-[19px] font-bold text-ink">{project.name}</div>
                {project.description && (
                  <p className="mb-4 line-clamp-2 text-[14.5px] leading-relaxed text-muted">
                    {project.description}
                  </p>
                )}
                {total > 0 && (
                  <>
                    <Progress value={pct} tone="amber" />
                    <div className="mt-2 flex justify-between text-[12.5px] font-semibold text-muted">
                      <span>
                        {done}/{total} tasks
                      </span>
                      {project.due_date && <span>Due {format(parseISO(project.due_date), "d MMM")}</span>}
                    </div>
                  </>
                )}
              </Link>
              <div className="flex items-center gap-3.5 px-6 pb-5 pt-3.5">
                <Link
                  href={`/work/${project.id}`}
                  className="text-[13px] font-bold text-teal hover:text-amber"
                >
                  Open the workspace
                </Link>
                <span className="flex-1" />
                <button
                  className="text-[12px] font-bold text-faint hover:text-teal"
                  onClick={() => openEdit(project)}
                >
                  Edit
                </button>
                <button
                  className="text-[12px] font-bold text-faint hover:text-mahogany"
                  onClick={() => handleDelete(project.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <AddRowButton onClick={openNew}>Start a project</AddRowButton>

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editing} clients={clients} />
    </div>
  );
}
