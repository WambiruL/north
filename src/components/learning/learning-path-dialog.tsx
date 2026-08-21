"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { learningPathSchema, type LearningPathInput } from "@/lib/validation/learning";
import { saveLearningPath } from "@/server/actions/learning";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillPicker } from "@/components/skills/skill-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Skill = Tables<"skills">;
type LearningPath = Tables<"learning_paths">;

export interface LearningPathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path?: LearningPath;
  skills: Skill[];
  onSkillCreated?: (skill: Skill) => void;
}

function toDefaults(path?: LearningPath): LearningPathInput {
  if (path) {
    return {
      title: path.title,
      description: path.description ?? undefined,
      skillId: path.skill_id ?? undefined,
      status: (path.status as LearningPathInput["status"]) ?? "active",
    };
  }
  return { title: "", description: undefined, skillId: undefined, status: "active" };
}

export function LearningPathDialog({
  open,
  onOpenChange,
  path,
  skills,
  onSkillCreated,
}: LearningPathDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<LearningPathInput>({
    resolver: zodResolver(learningPathSchema),
    values: toDefaults(path),
  });

  async function onSubmit(values: LearningPathInput) {
    setSubmitting(true);
    const result = await saveLearningPath(values, path?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(path ? "Learning path updated" : "Learning path created");
    onOpenChange(false);
    if (!path) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{path ? "Edit learning path" : "New learning path"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Learn Rust" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Target skill</Label>
            <Controller
              control={control}
              name="skillId"
              render={({ field }) => (
                <SkillPicker
                  skills={skills}
                  value={field.value}
                  onChange={(id) => field.onChange(id)}
                  onSkillCreated={onSkillCreated}
                />
              )}
            />
          </div>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : path ? "Save changes" : "Create path"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
