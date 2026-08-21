"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { hobbyProjectSchema, type HobbyProjectInput } from "@/lib/validation/hobbies";
import { saveHobbyProject } from "@/server/actions/hobbies";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HobbyProject = Tables<"hobby_projects">;

export interface HobbyProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  project?: HobbyProject;
}

function toDefaults(project?: HobbyProject): HobbyProjectInput {
  return {
    title: project?.title ?? "",
    status: (project?.status as HobbyProjectInput["status"]) ?? "active",
    notes: project?.notes ?? undefined,
  };
}

export function HobbyProjectDialog({
  open,
  onOpenChange,
  hobbyId,
  project,
}: HobbyProjectDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<HobbyProjectInput>({
    resolver: zodResolver(hobbyProjectSchema),
    values: toDefaults(project),
  });

  async function onSubmit(values: HobbyProjectInput) {
    setSubmitting(true);
    const result = await saveHobbyProject(hobbyId, values, project?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(project ? "Project updated" : "Project added");
    onOpenChange(false);
    if (!project) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What are you working on?" {...register("title")} />
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : project ? "Save changes" : "Add project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
