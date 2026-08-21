"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { courseSchema, type CourseInput } from "@/lib/validation/learning";
import { saveCourse } from "@/server/actions/learning";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Course = Tables<"courses">;
type LearningPath = Tables<"learning_paths">;

export interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
  paths: LearningPath[];
}

const NONE = "__none__";

function toDefaults(course?: Course): CourseInput {
  if (course) {
    return {
      title: course.title,
      provider: course.provider ?? undefined,
      status: (course.status as CourseInput["status"]) ?? "not_started",
      progress: course.progress,
      url: course.url ?? undefined,
      learningPathId: course.learning_path_id ?? undefined,
    };
  }
  return {
    title: "",
    provider: undefined,
    status: "not_started",
    progress: 0,
    url: undefined,
    learningPathId: undefined,
  };
}

export function CourseDialog({ open, onOpenChange, course, paths }: CourseDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, watch, reset } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema) as unknown as Resolver<CourseInput>,
    values: toDefaults(course),
  });

  const progress = watch("progress");

  async function onSubmit(values: CourseInput) {
    setSubmitting(true);
    const result = await saveCourse(values, course?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(course ? "Course updated" : "Course added");
    onOpenChange(false);
    if (!course) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{course ? "Edit course" : "Add a course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Advanced React Patterns" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Input id="provider" placeholder="Frontend Masters" {...register("provider")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://…" {...register("url")} />
          </div>
          {paths.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Learning path</Label>
              <Controller
                control={control}
                name="learningPathId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {paths.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not started</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="progress">Progress ({progress ?? 0}%)</Label>
            <Input id="progress" type="number" min="0" max="100" {...register("progress")} />
            <Progress value={progress ?? 0} className="mt-1" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : course ? "Save changes" : "Add course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
