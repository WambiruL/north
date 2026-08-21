"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectDialog } from "@/components/work/project-dialog";
import { removeProject, removeTask, saveTask, toggleTask } from "@/server/actions/work";

type Project = Tables<"work_projects"> & { client: Tables<"clients"> | null };
type Task = Tables<"work_tasks">;
type Transaction = Tables<"transactions">;
type ClientRow = Tables<"clients">;

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

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ProjectDetailClient({
  project,
  tasks,
  transactions,
  clients,
}: {
  project: Project;
  tasks: Task[];
  transactions: Transaction[];
  clients: ClientRow[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  async function handleDeleteProject() {
    await removeProject(project.id);
    toast.success("Project deleted");
    router.push("/work");
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    const result = await saveTask(project.id, { title: newTaskTitle.trim(), dueDate: undefined });
    setAddingTask(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setNewTaskTitle("");
    router.refresh();
  }

  async function handleToggleTask(id: string) {
    await toggleTask(id, project.id);
    router.refresh();
  }

  async function handleDeleteTask(id: string) {
    await removeTask(id, project.id);
    toast.success("Task removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/work"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to work
      </Link>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[30px] font-bold tracking-tight text-ink">{project.name}</h1>
              <Badge variant={STATUS_TONE[project.status] ?? "default"}>
                {STATUS_LABELS[project.status] ?? project.status}
              </Badge>
            </div>
            {project.client && (
              <p className="mt-1 text-[13.5px] text-muted">{project.client.name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteProject}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>

        {project.description && (
          <p className="text-[13.5px] leading-relaxed text-muted">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-faint">
          <span>Started {format(parseISO(project.start_date), "d MMM yyyy")}</span>
          {project.due_date && <span>Due {format(parseISO(project.due_date), "d MMM yyyy")}</span>}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-[17px] font-bold text-ink">Tasks</h2>

        {tasks.length === 0 ? (
          <p className="text-[13.5px] text-muted">No tasks yet. Add the first one below.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-[10px] border border-line bg-raise px-3.5 py-2.5"
              >
                <Checkbox checked={task.is_done} onChange={() => handleToggleTask(task.id)} />
                <span
                  className={
                    "flex-1 text-[13.5px] " +
                    (task.is_done ? "text-faint line-through" : "text-ink")
                  }
                >
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-[11.5px] text-faint">
                    {format(parseISO(task.due_date), "d MMM")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task"
          />
          <Button type="submit" variant="secondary" disabled={addingTask}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-[17px] font-bold text-ink">Related transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-[13.5px] text-muted">
            No transactions attributed to this project yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-raise px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] text-ink">{t.description}</div>
                  <div className="text-[11.5px] text-faint">
                    {format(parseISO(t.occurred_on), "d MMM yyyy")}
                  </div>
                </div>
                <span
                  className={
                    "shrink-0 text-[13.5px] font-semibold " +
                    (t.amount >= 0 ? "text-teal" : "text-ink")
                  }
                >
                  {currency.format(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
