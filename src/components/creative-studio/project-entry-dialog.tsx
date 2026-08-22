"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projectEntrySchema, type ProjectEntryInput } from "@/lib/validation/creative";
import { saveProjectEntry } from "@/server/actions/creative";
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

type ProjectEntry = Tables<"creative_project_entries">;

export interface ProjectEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  entry?: ProjectEntry;
}

function toDefaults(entry?: ProjectEntry): ProjectEntryInput {
  return {
    title: entry?.title ?? "",
    body: entry?.body ?? undefined,
    imageUrl: entry?.image_url ?? undefined,
  };
}

export function ProjectEntryDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  entry,
}: ProjectEntryDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ProjectEntryInput>({
    resolver: zodResolver(projectEntrySchema),
    values: toDefaults(entry),
  });

  async function onSubmit(values: ProjectEntryInput) {
    setSubmitting(true);
    const result = await saveProjectEntry(projectId, projectTitle, values, entry?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(entry ? "Page updated" : "Page added");
    router.refresh();
    onOpenChange(false);
    if (!entry) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit page" : "New page"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What's this entry about?" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Entry</Label>
            <Textarea id="body" rows={6} placeholder="Write it down." {...register("body")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" placeholder="Paste an image URL" {...register("imageUrl")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : entry ? "Save changes" : "Write an entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
