"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO, isPast } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { toggleFocusTask } from "@/server/actions/work";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database.types";

type FocusTask = Tables<"work_tasks"> & { work_project: { id: string; name: string } | null };

export function FocusCards({ tasks }: { tasks: FocusTask[] }) {
  const router = useRouter();

  async function handleDone(id: string) {
    await toggleFocusTask(id);
    toast.success("Nice — marked done");
    router.refresh();
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Nothing flagged for today"
        description="Mark a task as a priority from a work project and it'll show up here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tasks.map((task) => {
        const overdue = task.due_date ? isPast(parseISO(task.due_date)) : false;
        return (
          <Card key={task.id} className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={task.is_priority ? "amber" : "default"}>
                {task.is_priority ? "Priority" : "Task"}
              </Badge>
              {task.due_date && (
                <span className={cn("text-[12.5px] font-bold", overdue ? "text-mahogany" : "text-muted")}>
                  {format(parseISO(task.due_date), "d MMM")}
                </span>
              )}
            </div>
            <Link href={task.work_project ? `/work/${task.work_project.id}` : "/work"} className="min-w-0">
              <div className="text-[16px] font-bold leading-snug text-ink">{task.title}</div>
              {task.work_project && (
                <div className="mt-1.5 truncate text-[12.5px] text-muted">{task.work_project.name}</div>
              )}
            </Link>
            <button
              onClick={() => handleDone(task.id)}
              className="mt-auto self-start rounded-[10px] border border-line bg-surface-2 px-3.5 py-2 text-[12.5px] font-bold text-ink transition-colors hover:border-teal hover:text-teal"
            >
              Mark done
            </button>
          </Card>
        );
      })}
    </div>
  );
}
