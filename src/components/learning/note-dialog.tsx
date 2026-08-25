"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { noteSchema, type NoteInput, type NoteFormInput } from "@/lib/validation/learning";
import { saveNote } from "@/server/actions/learning";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StringListInput } from "@/components/ui/string-list-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Note = Tables<"learning_notes">;
type Skill = Tables<"skills">;

export interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note;
  skills: Skill[];
}

const NONE = "__none__";

function toDefaults(note?: Note): NoteInput {
  if (note) {
    return {
      title: note.title,
      body: note.body,
      tags: note.tags,
      linkedSkillId: note.linked_skill_id ?? undefined,
    };
  }
  return { title: "", body: "", tags: [], linkedSkillId: undefined };
}

export function NoteDialog({ open, onOpenChange, note, skills }: NoteDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, watch, setValue, reset } = useForm<
    NoteFormInput,
    unknown,
    NoteInput
  >({
    resolver: zodResolver(noteSchema),
    values: toDefaults(note),
  });
  const tags = watch("tags") ?? [];

  async function onSubmit(values: NoteInput) {
    setSubmitting(true);
    const result = await saveNote(values, note?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(note ? "Note updated" : "Note added");
    router.refresh();
    onOpenChange(false);
    if (!note) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "Write a note"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Ask, then say nothing" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Note</Label>
            <Textarea id="body" rows={5} {...register("body")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <StringListInput
              value={tags}
              onChange={(next) => setValue("tags", next)}
              placeholder="Add a tag"
              layout="chips"
            />
          </div>
          {skills.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Connected to</Label>
              <Controller
                control={control}
                name="linkedSkillId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nothing in particular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Nothing in particular</SelectItem>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : note ? "Save changes" : "Write note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
