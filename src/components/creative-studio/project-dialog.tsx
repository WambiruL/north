"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { creativeProjectSchema, type CreativeProjectInput } from "@/lib/validation/creative";
import { saveProject } from "@/server/actions/creative";
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

type CreativeProject = Tables<"creative_projects">;

export interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: CreativeProject;
}

function toDefaults(project?: CreativeProject): CreativeProjectInput {
  return {
    title: project?.title ?? "",
    description: project?.description ?? undefined,
    status: (project?.status as CreativeProjectInput["status"]) ?? "active",
    coverUrl: project?.cover_url ?? undefined,
    tools: project?.tools ?? undefined,
    linkUrl: project?.link_url ?? undefined,
  };
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CreativeProjectInput>({
    resolver: zodResolver(creativeProjectSchema),
    values: toDefaults(project),
  });

  async function onSubmit(values: CreativeProjectInput) {
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
          <DialogTitle>{project ? "Edit project" : "Start a new project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What are you making?" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
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
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverUrl">Cover image URL</Label>
            <Input id="coverUrl" placeholder="Paste an image URL" {...register("coverUrl")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tools">Made with</Label>
            <Input id="tools" placeholder="e.g. Watercolor, hot press paper" {...register("tools")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkUrl">Link</Label>
            <Input id="linkUrl" placeholder="Where to see the finished piece" {...register("linkUrl")} />
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
