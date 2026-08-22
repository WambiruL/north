"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { futureLetterSchema, type FutureLetterInput } from "@/lib/validation/dream-life";
import { saveFutureLetter } from "@/server/actions/dream-life";
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

type FutureLetter = Tables<"future_letters">;

export interface FutureLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter?: FutureLetter;
  defaultPrompt?: string;
}

function toDefaults(letter?: FutureLetter, defaultPrompt?: string): FutureLetterInput {
  if (letter) {
    return { prompt: letter.prompt, body: letter.body };
  }
  return { prompt: defaultPrompt ?? "", body: "" };
}

export function FutureLetterDialog({
  open,
  onOpenChange,
  letter,
  defaultPrompt,
}: FutureLetterDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<FutureLetterInput>({
    resolver: zodResolver(futureLetterSchema),
    values: toDefaults(letter, defaultPrompt),
  });

  async function onSubmit(values: FutureLetterInput) {
    setSubmitting(true);
    const result = await saveFutureLetter(values, letter?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(letter ? "Letter updated" : "Saved to your future self");
    router.refresh();
    onOpenChange(false);
    if (!letter) reset(toDefaults(undefined, defaultPrompt));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{letter ? "Edit letter" : "Write to your future self"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt">Title</Label>
            <Input id="prompt" placeholder="Dear future me," {...register("prompt")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Letter</Label>
            <Textarea
              id="body"
              rows={8}
              placeholder="Write whatever's true right now. They'll want to know."
              {...register("body")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : letter ? "Save changes" : "Save letter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
