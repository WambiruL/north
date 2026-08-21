"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { hobbyMemorySchema, type HobbyMemoryInput } from "@/lib/validation/hobbies";
import { saveHobbyMemory } from "@/server/actions/hobbies";
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

export interface HobbyMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  hobbyName: string;
}

function defaults(): HobbyMemoryInput {
  return {
    caption: "",
    imageUrl: undefined,
    occurredOn: new Date().toISOString().slice(0, 10),
  };
}

export function HobbyMemoryDialog({
  open,
  onOpenChange,
  hobbyId,
  hobbyName,
}: HobbyMemoryDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<HobbyMemoryInput>({
    resolver: zodResolver(hobbyMemorySchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: HobbyMemoryInput) {
    setSubmitting(true);
    const result = await saveHobbyMemory(hobbyId, hobbyName, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Memory added");
    onOpenChange(false);
    reset(defaults());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a memory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" rows={2} placeholder="What happened?" {...register("caption")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredOn">Date</Label>
            <Input id="occurredOn" type="date" {...register("occurredOn")} />
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
              {submitting ? "Saving…" : "Add memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
