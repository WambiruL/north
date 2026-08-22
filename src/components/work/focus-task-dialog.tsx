"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { focusTaskSchema, type FocusTaskInput } from "@/lib/validation/work";
import { saveFocusTask } from "@/server/actions/work";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Task = Tables<"work_tasks">;
type ProjectOption = { id: string; name: string };

export interface FocusTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  projects: ProjectOption[];
  /** Determines the default flavor for a brand-new item: priority vs. plain deadline. */
  defaultIsPriority?: boolean;
}

function toDefaults(task?: Task, defaultProjectId?: string, defaultIsPriority?: boolean): FocusTaskInput {
  if (task) {
    return {
      title: task.title,
      workProjectId: task.work_project_id,
      dueDate: task.due_date ?? undefined,
      isPriority: task.is_priority,
    };
  }
  return {
    title: "",
    workProjectId: defaultProjectId ?? "",
    dueDate: undefined,
    isPriority: defaultIsPriority ?? false,
  };
}

export function FocusTaskDialog({
  open,
  onOpenChange,
  task,
  projects,
  defaultIsPriority,
}: FocusTaskDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<FocusTaskInput>({
    resolver: zodResolver(focusTaskSchema) as unknown as Resolver<FocusTaskInput>,
    values: toDefaults(task, projects[0]?.id, defaultIsPriority),
  });

  async function onSubmit(values: FocusTaskInput) {
    setSubmitting(true);
    const result = await saveFocusTask(values, task?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(task ? "Updated" : values.isPriority ? "Priority added" : "Deadline added");
    router.refresh();
    onOpenChange(false);
    if (!task) reset(toDefaults(undefined, projects[0]?.id, defaultIsPriority));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit item" : defaultIsPriority ? "New priority" : "New deadline"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">What</Label>
            <Input id="title" {...register("title")} placeholder="Ship the Kestrel handover" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Project</Label>
            <Controller
              control={control}
              name="workProjectId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <Controller
            control={control}
            name="isPriority"
            render={({ field }) => (
              <label className="flex items-center gap-2.5 text-[13.5px] text-ink">
                <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                Treat as a top priority today
              </label>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : task ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
