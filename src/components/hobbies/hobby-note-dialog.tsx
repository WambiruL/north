"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { hobbyNoteSchema, type HobbyNoteInput } from "@/lib/validation/hobbies";
import { saveHobbyNote } from "@/server/actions/hobbies";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type HobbyNote = Tables<"hobby_notes">;

export interface HobbyNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  note?: HobbyNote;
}

function toDefaults(note?: HobbyNote): HobbyNoteInput {
  return { body: note?.body ?? "" };
}

export function HobbyNoteDialog({ open, onOpenChange, hobbyId, note }: HobbyNoteDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<HobbyNoteInput>({
    resolver: zodResolver(hobbyNoteSchema),
    values: toDefaults(note),
  });

  async function onSubmit(values: HobbyNoteInput) {
    setSubmitting(true);
    const result = await saveHobbyNote(hobbyId, values, note?.id);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "Add a note"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <Textarea id="body" rows={6} placeholder="Whatever's on your mind about this one." {...register("body")} />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : note ? "Save changes" : "Add note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
