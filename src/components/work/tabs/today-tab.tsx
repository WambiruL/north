"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import type { Tables } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/work/shared";
import { formatCurrency } from "@/lib/currency";
import { FocusTaskDialog } from "@/components/work/focus-task-dialog";
import { toggleFocusTask, removeFocusTask } from "@/server/actions/work";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Task = Tables<"work_tasks"> & { work_project: { id: string; name: string } | null };
type Invoice = Tables<"invoices"> & { client: { id: string; name: string } | null };
type ProjectOption = { id: string; name: string };

function dueLabel(dueDate: string | null): { label: string; tone: "mahogany" | "amber" | "teal" | "default" } {
  if (!dueDate) return { label: "Ongoing", tone: "default" };
  const days = differenceInCalendarDays(parseISO(dueDate), new Date());
  if (days < 0) return { label: "Overdue", tone: "mahogany" };
  if (days <= 2) return { label: "Urgent", tone: "amber" };
  if (days <= 7) return { label: "This week", tone: "teal" };
  return { label: format(parseISO(dueDate), "d MMM"), tone: "default" };
}

export function TodayTab({
  tasks,
  invoices,
  projects,
  currency,
}: {
  tasks: Task[];
  invoices: Invoice[];
  projects: ProjectOption[];
  currency: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);
  const [defaultIsPriority, setDefaultIsPriority] = useState(false);

  const priorities = tasks.filter((t) => t.is_priority).slice(0, 3);
  const deadlines = tasks
    .filter((t) => t.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
    .slice(0, 6);
  const outstandingInvoices = invoices.filter((i) => i.status !== "paid").slice(0, 6);
  const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

  function openNew(isPriority: boolean) {
    setEditing(undefined);
    setDefaultIsPriority(isPriority);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDefaultIsPriority(task.is_priority);
    setDialogOpen(true);
  }

  async function handleToggle(id: string) {
    await toggleFocusTask(id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const task = tasks.find((t) => t.id === id);
    const ok = await confirm({
      title: `Delete "${task?.title ?? "this task"}"?`,
      description: "This can't be undone.",
    });
    if (!ok) return;
    await removeFocusTask(id);
    toast.success("Removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-[25px] font-bold tracking-tight text-ink">
          What moves work forward today
        </h2>
        <p className="mt-1 text-[15.5px] text-muted">
          {priorities.length > 0
            ? `${priorities.length} thing${priorities.length === 1 ? "" : "s"}. Everything else is later's problem.`
            : "Nothing flagged yet. Mark a task as a priority to see it here."}
        </p>
      </div>

      {priorities.length === 0 ? (
        <EmptyState
          title="No priorities set"
          description="Pick the handful of things that actually matter today."
          action={
            <Button variant="accent" onClick={() => openNew(true)}>
              Add a priority
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {priorities.map((task) => {
              const due = dueLabel(task.due_date);
              return (
                <div
                  key={task.id}
                  className="flex flex-col rounded-[18px] border border-line bg-surface p-6 shadow-north-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-north-md"
                >
                  <div className="mb-4 flex items-center justify-between gap-2.5">
                    <Badge variant={due.tone === "default" ? "default" : due.tone}>{due.label}</Badge>
                    {task.due_date && (
                      <span className="text-[12.5px] font-bold text-muted">
                        {format(parseISO(task.due_date), "d MMM")}
                      </span>
                    )}
                  </div>
                  <div className="text-[17px] font-bold text-ink">{task.title}</div>
                  {task.work_project && (
                    <div className="mb-5 mt-2.5 text-[13.5px] font-bold text-teal">
                      {task.work_project.name}
                    </div>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => handleToggle(task.id)}>
                    Mark done
                  </Button>
                  <RowActions onEdit={() => openEdit(task)} onDelete={() => handleDelete(task.id)} />
                </div>
              );
            })}
          </div>
          <AddRowButton onClick={() => openNew(true)}>Add a priority</AddRowButton>
        </>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Deadlines
          </div>
          {deadlines.length === 0 ? (
            <p className="text-[13.5px] text-muted">Nothing with a date on it yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {deadlines.map((task) => {
                const due = dueLabel(task.due_date);
                return (
                  <div key={task.id} className="flex items-center gap-3.5">
                    <Badge variant={due.tone === "default" ? "default" : due.tone}>{due.label}</Badge>
                    <span className="flex-1 text-[14.5px] text-ink">{task.title}</span>
                    <button
                      className="text-[12px] font-bold text-faint hover:text-teal"
                      onClick={() => openEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-[12px] font-bold text-faint hover:text-mahogany"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <AddRowButton onClick={() => openNew(false)}>Add a deadline</AddRowButton>
        </div>

        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Waiting on money
          </div>
          {outstandingInvoices.length === 0 ? (
            <p className="text-[13.5px] text-muted">Nothing outstanding right now.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {outstandingInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-3">
                  <span
                    className={
                      "h-2 w-2 shrink-0 rounded-full " +
                      (invoice.status === "overdue" ? "bg-mahogany" : "bg-amber")
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-ink">{invoice.title}</div>
                    <div className="text-[12px] text-faint">
                      {invoice.client?.name ?? "No client"} ·{" "}
                      {invoice.due_on
                        ? `due ${format(parseISO(invoice.due_on), "d MMM")}`
                        : STATUS_LABEL[invoice.status]}
                    </div>
                  </div>
                  <span className="text-[14.5px] font-bold text-ink">{formatCurrency(Number(invoice.amount), currency)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 flex justify-between border-t border-line-2 pt-4 text-[14px]">
            <span className="text-muted">Outstanding</span>
            <span className="font-bold text-ink">{formatCurrency(outstandingTotal, currency)}</span>
          </div>
        </div>
      </div>

      <FocusTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        projects={projects}
        defaultIsPriority={defaultIsPriority}
      />
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  draft: "draft",
  sent: "sent",
  paid: "paid",
  overdue: "overdue",
};
