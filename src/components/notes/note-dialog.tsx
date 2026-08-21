"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { noteSchema, type NoteFormValues } from "@/lib/validation/notes";
import { saveNote } from "@/server/actions/notes";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Note = Tables<"notes">;

export interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note;
}

function toDefaults(note?: Note): NoteFormValues {
  if (note) {
    return {
      title: note.title,
      body: note.body,
      pinned: note.pinned,
      tags: note.tags,
    };
  }
  return { title: "", body: "", pinned: false, tags: [] };
}

export function NoteDialog({ open, onOpenChange, note }: NoteDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tagsText, setTagsText] = useState(note?.tags?.join(", ") ?? "");
  const [syncedNoteId, setSyncedNoteId] = useState(note?.id);
  const { register, handleSubmit, control, reset } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    values: toDefaults(note),
  });

  // Keep the free-text tags field in sync when the dialog is retargeted at a
  // different note (or from edit back to create), without an effect.
  if (note?.id !== syncedNoteId) {
    setSyncedNoteId(note?.id);
    setTagsText(note?.tags?.join(", ") ?? "");
  }

  async function onSubmit(values: NoteFormValues) {
    setSubmitting(true);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const result = await saveNote(
      {
        title: values.title ?? "",
        body: values.body ?? "",
        pinned: values.pinned ?? false,
        tags,
      },
      note?.id,
    );
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(note ? "Note updated" : "Note saved");
    router.refresh();
    onOpenChange(false);
    if (!note) {
      reset(toDefaults(undefined));
      setTagsText("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Untitled" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Note</Label>
            <Textarea
              id="body"
              rows={8}
              placeholder="Write it down before it slips away…"
              {...register("body")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="ideas, work, book"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </div>

          <Controller
            control={control}
            name="pinned"
            render={({ field }) => (
              <label className="flex items-center gap-2.5 text-[13.5px] text-ink">
                <Checkbox
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                Pin this note
              </label>
            )}
          />

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
