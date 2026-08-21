"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, Briefcase } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ProjectDialog } from "@/components/work/project-dialog";
import { ClientDialog } from "@/components/work/client-dialog";
import { removeProject } from "@/server/actions/work";

type Project = Tables<"work_projects"> & {
  client: { id: string; name: string } | null;
  taskCounts: { done: number; total: number };
};
type ClientRow = Tables<"clients">;

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

const STATUS_TONE: Record<string, "teal" | "amber" | "default" | "mahogany"> = {
  active: "teal",
  on_hold: "amber",
  completed: "default",
  archived: "mahogany",
};

export function WorkClient({
  projects,
  clients,
  autoOpen,
}: {
  projects: Project[];
  clients: ClientRow[];
  autoOpen: "project" | "task" | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("active");
  const [projectDialogOpen, setProjectDialogOpen] = useState(
    () => autoOpen === "project" || (autoOpen === "task" && projects.length === 0),
  );
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>(undefined);

  useEffect(() => {
    if (autoOpen === "task" && projects.length > 0) {
      toast.info("Open a project to add a task.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  function openNew() {
    setEditing(undefined);
    setProjectDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setProjectDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeProject(id);
    toast.success("Project deleted");
    router.refresh();
  }

  const grouped = STATUS_TABS.reduce<Record<string, Project[]>>((acc, s) => {
    acc[s.value] = projects.filter((p) => p.status === s.value);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Work</h1>
          <p className="mt-1 text-[13.5px] text-muted">Here is your professional world.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setClientDialogOpen(true)}>
            New client
          </Button>
          <Button variant="accent" onClick={openNew}>
            New project
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title="No projects yet"
          description="Add your first project to start tracking tasks and related spending."
          action={
            <Button variant="accent" onClick={openNew}>
              Create a project
            </Button>
          }
        />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {STATUS_TABS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label} ({grouped[s.value]?.length ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map((s) => (
            <TabsContent key={s.value} value={s.value}>
              {grouped[s.value]?.length === 0 ? (
                <EmptyState
                  title={`No ${s.label.toLowerCase()} projects`}
                  description="Projects will show up here once they match this status."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {grouped[s.value]?.map((project) => {
                    const { done, total } = project.taskCounts;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <Card key={project.id} className="flex flex-col gap-3 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/work/${project.id}`} className="min-w-0 flex-1">
                            <div className="truncate text-[15px] font-bold text-ink hover:underline">
                              {project.name}
                            </div>
                            {project.client && (
                              <div className="mt-0.5 truncate text-[12.5px] text-muted">
                                {project.client.name}
                              </div>
                            )}
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Project actions">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(project)}>
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(project.id)}>
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <Badge variant={STATUS_TONE[project.status] ?? "default"}>
                          {STATUS_TABS.find((s2) => s2.value === project.status)?.label ?? project.status}
                        </Badge>

                        {total > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[12px] text-muted">
                              <span>Tasks</span>
                              <span>
                                {done}/{total}
                              </span>
                            </div>
                            <Progress value={pct} />
                          </div>
                        )}

                        {project.due_date && (
                          <div className="text-[12px] text-faint">
                            Due {format(parseISO(project.due_date), "d MMM yyyy")}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        project={editing}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} />
    </div>
  );
}
