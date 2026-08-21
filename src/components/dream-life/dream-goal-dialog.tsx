"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dreamGoalSchema, type DreamGoalInput } from "@/lib/validation/dream-life";
import { saveDreamGoal } from "@/server/actions/dream-life";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Dream = Tables<"dreams">;

export interface DreamGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dreams: Dream[];
  /** Preset and lock the parent dream, e.g. when adding a goal inline from a dream card. */
  dreamId?: string;
}

function toDefaults(dreamId?: string): DreamGoalInput {
  return { dreamId: dreamId ?? "", title: "", targetDate: "" };
}

export function DreamGoalDialog({ open, onOpenChange, dreams, dreamId }: DreamGoalDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<DreamGoalInput>({
    resolver: zodResolver(dreamGoalSchema),
    values: toDefaults(dreamId),
  });

  async function onSubmit(values: DreamGoalInput) {
    setSubmitting(true);
    const result = await saveDreamGoal(values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Goal added");
    router.refresh();
    onOpenChange(false);
    reset(toDefaults(dreamId));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {!dreamId && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dreamId">Dream</Label>
              <Controller
                control={control}
                name="dreamId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="dreamId">
                      <SelectValue placeholder="Pick a dream" />
                    </SelectTrigger>
                    <SelectContent>
                      {dreams.map((dream) => (
                        <SelectItem key={dream.id} value={dream.id}>
                          {dream.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Goal</Label>
            <Input id="title" placeholder="A concrete step toward it" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetDate">Target date</Label>
            <Input id="targetDate" type="date" {...register("targetDate")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : "Add goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
