"use client";

import { useState } from "react";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { workNoteSchema, type WorkNoteInput } from "@/lib/validation/work";
import { saveWorkNote } from "@/server/actions/work";
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

type WorkNote = Tables<"work_notes">;
type ProjectOption = { id: string; name: string };

const NO_PROJECT = "__none__";

export interface WorkNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: WorkNote;
  projects: ProjectOption[];
}

function toDefaults(note?: WorkNote): WorkNoteInput {
  if (note) {
    return {
      title: note.title,
      body: note.body,
      metWith: note.met_with ?? undefined,
      workProjectId: note.work_project_id ?? null,
      occurredOn: note.occurred_on,
    };
  }
  return {
    title: "",
    body: "",
    metWith: "",
    workProjectId: null,
    occurredOn: dateISOInTimezone(detectTimezone()),
  };
}

export function WorkNoteDialog({ open, onOpenChange, note, projects }: WorkNoteDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<WorkNoteInput>({
    resolver: zodResolver(workNoteSchema) as unknown as Resolver<WorkNoteInput>,
    values: toDefaults(note),
  });

  async function onSubmit(values: WorkNoteInput) {
    setSubmitting(true);
    const result = await saveWorkNote(values, note?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(note ? "Note updated" : "Note saved");
    router.refresh();
    onOpenChange(false);
    if (!note) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "Write a note"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Kickoff call notes" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metWith">With</Label>
              <Input id="metWith" {...register("metWith")} placeholder="Who was there" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Project (optional)</Label>
            <Controller
              control={control}
              name="workProjectId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NO_PROJECT}
                  onValueChange={(v) => field.onChange(v === NO_PROJECT ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROJECT}>No project</SelectItem>
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
            <Label htmlFor="body">Notes</Label>
            <Textarea id="body" rows={5} {...register("body")} placeholder="What came up" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : note ? "Save changes" : "Save note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
