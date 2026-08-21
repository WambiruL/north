"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { checkInSchema, type CheckInInput } from "@/lib/validation/check-ins";
import { saveCheckIn } from "@/server/actions/check-ins";
import { pickReflectionPrompt } from "@/lib/constants/reflection-prompts";
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
import { ScalePicker } from "@/components/check-ins/scale-picker";

type CheckIn = Tables<"check_ins">;

export interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkIn?: CheckIn;
}

function toDefaults(checkIn?: CheckIn): CheckInInput {
  if (checkIn) {
    return {
      entryDate: checkIn.entry_date,
      mood: checkIn.mood,
      energy: checkIn.energy,
      stress: checkIn.stress,
      sleepHours: checkIn.sleep_hours ?? undefined,
      reflectionPrompt: checkIn.reflection_prompt ?? undefined,
      reflection: checkIn.reflection ?? undefined,
      tags: checkIn.tags,
    };
  }
  return {
    entryDate: new Date().toISOString().slice(0, 10),
    mood: 3,
    energy: 3,
    stress: 3,
    sleepHours: undefined,
    reflectionPrompt: pickReflectionPrompt(),
    reflection: "",
    tags: [],
  };
}

export function CheckInDialog({ open, onOpenChange, checkIn }: CheckInDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    values: toDefaults(checkIn),
  });

  async function onSubmit(values: CheckInInput) {
    setSubmitting(true);
    const result = await saveCheckIn(values, checkIn?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(checkIn ? "Check-in updated" : "Checked in");
    onOpenChange(false);
    if (!checkIn) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{checkIn ? "Edit check-in" : "How are you, today?"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryDate">Date</Label>
            <Input id="entryDate" type="date" {...register("entryDate")} />
          </div>

          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <ScalePicker label="Mood" tone="amber" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="energy"
            render={({ field }) => (
              <ScalePicker label="Energy" tone="teal" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="stress"
            render={({ field }) => (
              <ScalePicker
                label="Stress"
                tone="mahogany"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleepHours">Sleep (hours)</Label>
            <Input id="sleepHours" type="number" step="0.5" min="0" max="24" {...register("sleepHours")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reflection">
              {toDefaults(checkIn).reflectionPrompt ?? "What matters most today?"}
            </Label>
            <Textarea id="reflection" rows={3} {...register("reflection")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : checkIn ? "Save changes" : "Check in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
