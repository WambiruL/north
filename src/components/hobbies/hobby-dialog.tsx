"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { hobbySchema, type HobbyInput } from "@/lib/validation/hobbies";
import { saveHobby } from "@/server/actions/hobbies";
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

type Hobby = Tables<"hobbies">;

export interface HobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobby?: Hobby;
}

function toDefaults(hobby?: Hobby): HobbyInput {
  return {
    name: hobby?.name ?? "",
    description: hobby?.description ?? undefined,
    coverUrl: hobby?.cover_url ?? undefined,
  };
}

export function HobbyDialog({ open, onOpenChange, hobby }: HobbyDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<HobbyInput>({
    resolver: zodResolver(hobbySchema),
    values: toDefaults(hobby),
  });

  async function onSubmit(values: HobbyInput) {
    setSubmitting(true);
    const result = await saveHobby(values, hobby?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(hobby ? "Hobby updated" : "Hobby added");
    onOpenChange(false);
    if (!hobby) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{hobby ? "Edit hobby" : "Pick up a new hobby"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Watercolor painting" {...register("name")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="What draws you to it?"
              {...register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverUrl">Cover image URL</Label>
            <Input id="coverUrl" placeholder="Paste an image URL" {...register("coverUrl")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : hobby ? "Save changes" : "Add hobby"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
