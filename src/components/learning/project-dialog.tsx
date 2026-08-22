"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  projectSchema,
  type ProjectInput,
  type ProjectFormInput,
} from "@/lib/validation/learning";
import { saveProject } from "@/server/actions/learning";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Project = Tables<"learning_projects">;

export interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

function toDefaults(project?: Project): ProjectInput {
  if (project) {
    return {
      title: project.title,
      progress: project.progress,
      dueDate: project.due_date ?? undefined,
      skillsPractised: project.skills_practised ?? undefined,
      outcome: project.outcome ?? undefined,
    };
  }
  return { title: "", progress: 0, dueDate: undefined, skillsPractised: undefined, outcome: undefined };
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, reset } = useForm<
    ProjectFormInput,
    unknown,
    ProjectInput
  >({
    resolver: zodResolver(projectSchema),
    values: toDefaults(project),
  });
  const progress = Number(watch("progress")) || 0;

  async function onSubmit(values: ProjectInput) {
    setSubmitting(true);
    const result = await saveProject(values, project?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(project ? "Project updated" : "Project started");
    router.refresh();
    onOpenChange(false);
    if (!project) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Start a learning project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Rebuild my portfolio in a new stack" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="progress">Progress ({progress}%)</Label>
            <Input id="progress" type="number" min="0" max="100" {...register("progress")} />
            <Progress value={progress} className="mt-1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dueDate">Due</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="skillsPractised">Skills practised</Label>
            <Input id="skillsPractised" placeholder="Motion design, React" {...register("skillsPractised")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="outcome">What it produces</Label>
            <Textarea id="outcome" rows={3} {...register("outcome")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : project ? "Save changes" : "Start project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
