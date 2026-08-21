import Link from "next/link";
import { format, parseISO, isPast } from "date-fns";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface PriorityTask {
  id: string;
  title: string;
  due_date: string | null;
  work_project_id: string;
  work_projects: { name: string } | null;
}

export function PrioritiesList({ tasks }: { tasks: PriorityTask[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Nothing pressing"
        description="No open tasks with a due date. Add one from a work project when something needs doing."
      />
    );
  }

  return (
    <Card className="flex flex-col divide-y divide-line-2 p-0">
      {tasks.map((task) => {
        const overdue = task.due_date ? isPast(parseISO(task.due_date)) : false;
        return (
          <Link
            key={task.id}
            href={`/work/${task.work_project_id}`}
            className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-ink">{task.title}</p>
              <p className="truncate text-[11.5px] text-faint">{task.work_projects?.name}</p>
            </div>
            {task.due_date && (
              <span
                className={cn(
                  "shrink-0 text-[11.5px] font-semibold",
                  overdue ? "text-mahogany" : "text-muted",
                )}
              >
                {format(parseISO(task.due_date), "d MMM")}
              </span>
            )}
          </Link>
        );
      })}
    </Card>
  );
}
