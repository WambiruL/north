"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { moodboardSchema, type MoodboardInput } from "@/lib/validation/creative";
import { saveMoodboard } from "@/server/actions/creative";
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

type Moodboard = Tables<"creative_moodboards">;

export interface MoodboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moodboard?: Moodboard;
}

function toDefaults(moodboard?: Moodboard): MoodboardInput {
  return {
    title: moodboard?.title ?? "",
    note: moodboard?.note ?? undefined,
    imageUrls: moodboard?.image_urls && moodboard.image_urls.length > 0
      ? moodboard.image_urls.join("\n")
      : undefined,
  };
}

export function MoodboardDialog({ open, onOpenChange, moodboard }: MoodboardDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<MoodboardInput>({
    resolver: zodResolver(moodboardSchema),
    values: toDefaults(moodboard),
  });

  async function onSubmit(values: MoodboardInput) {
    setSubmitting(true);
    const result = await saveMoodboard(values, moodboard?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(moodboard ? "Moodboard updated" : "Moodboard started");
    router.refresh();
    onOpenChange(false);
    if (!moodboard) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{moodboard ? "Edit moodboard" : "New moodboard"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What's this board about?" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={2} {...register("note")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrls">Image URLs</Label>
            <Textarea
              id="imageUrls"
              rows={4}
              placeholder="One image URL per line"
              {...register("imageUrls")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : moodboard ? "Save changes" : "Start moodboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
