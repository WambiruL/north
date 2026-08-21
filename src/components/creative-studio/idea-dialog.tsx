"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { creativeIdeaSchema, type CreativeIdeaInput } from "@/lib/validation/creative";
import { saveIdea } from "@/server/actions/creative";
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

type CreativeIdea = Tables<"creative_ideas">;

export interface IdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: CreativeIdea;
}

function toDefaults(idea?: CreativeIdea): CreativeIdeaInput {
  return {
    title: idea?.title ?? "",
    note: idea?.note ?? undefined,
    status: (idea?.status as CreativeIdeaInput["status"]) ?? "seed",
  };
}

export function IdeaDialog({ open, onOpenChange, idea }: IdeaDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CreativeIdeaInput>({
    resolver: zodResolver(creativeIdeaSchema),
    values: toDefaults(idea),
  });

  async function onSubmit(values: CreativeIdeaInput) {
    setSubmitting(true);
    const result = await saveIdea(values, idea?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(idea ? "Idea updated" : "Idea planted");
    onOpenChange(false);
    if (!idea) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{idea ? "Edit idea" : "New idea"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What's the idea?" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} {...register("note")} />
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
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="developing">Developing</SelectItem>
                    <SelectItem value="promoted">Promoted</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : idea ? "Save changes" : "Add idea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
