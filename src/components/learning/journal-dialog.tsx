"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { journalEntrySchema, type JournalEntryInput } from "@/lib/validation/learning";
import { saveJournalEntry } from "@/server/actions/learning";
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

type JournalEntry = Tables<"learning_journal_entries">;

export interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry;
}

function toDefaults(entry?: JournalEntry): JournalEntryInput {
  if (entry) {
    return { entryDate: entry.entry_date, prompt: entry.prompt, body: entry.body };
  }
  return { entryDate: new Date().toISOString().slice(0, 10), prompt: "", body: "" };
}

export function JournalDialog({ open, onOpenChange, entry }: JournalDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<JournalEntryInput>({
    resolver: zodResolver(journalEntrySchema),
    values: toDefaults(entry),
  });

  async function onSubmit(values: JournalEntryInput) {
    setSubmitting(true);
    const result = await saveJournalEntry(values, entry?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(entry ? "Entry updated" : "Entry added");
    router.refresh();
    onOpenChange(false);
    if (!entry) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit entry" : "Write an entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryDate">Date</Label>
            <Input id="entryDate" type="date" {...register("entryDate")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt">What you&apos;re reflecting on</Label>
            <Input id="prompt" placeholder="What surprised me this week" {...register("prompt")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Entry</Label>
            <Textarea id="body" rows={6} {...register("body")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : entry ? "Save changes" : "Write entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
