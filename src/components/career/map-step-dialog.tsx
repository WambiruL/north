"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { mapStepSchema, careerMapStages, type MapStepInput } from "@/lib/validation/career";
import { saveMapStep } from "@/server/actions/career";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type MapStep = Tables<"career_map_steps">;

export interface MapStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step?: MapStep;
}

function toDefaults(step?: MapStep): MapStepInput {
  if (step) {
    return { stage: step.stage, label: step.label, note: step.note ?? undefined };
  }
  return { stage: careerMapStages[0], label: "", note: undefined };
}

export function MapStepDialog({ open, onOpenChange, step }: MapStepDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<MapStepInput>({
    resolver: zodResolver(mapStepSchema),
    values: toDefaults(step),
  });

  async function onSubmit(values: MapStepInput) {
    setSubmitting(true);
    const result = await saveMapStep(values, step?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(step ? "Step updated" : "Step added");
    router.refresh();
    onOpenChange(false);
    if (!step) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step ? "Edit step" : "Add a step"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Column</Label>
            <Controller
              control={control}
              name="stage"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {careerMapStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label">Label</Label>
            <Input id="label" placeholder="Staff designer" {...register("label")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : step ? "Save changes" : "Add step"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
