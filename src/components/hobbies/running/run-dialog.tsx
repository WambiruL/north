"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { runSchema, type RunInput } from "@/lib/validation/running";
import { saveRun } from "@/server/actions/running";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Run = Tables<"runs">;

function toDefaults(run?: Run): RunInput {
  if (run) {
    return {
      occurredOn: run.occurred_on,
      distanceKm: Number(run.distance_km),
      durationMinutes: Number(run.duration_minutes),
      route: run.route ?? undefined,
      feeling: run.feeling ?? undefined,
      notes: run.notes ?? undefined,
    };
  }
  return { occurredOn: dateISOInTimezone(detectTimezone()), distanceKm: 0, durationMinutes: 0 };
}

export function RunDialog({
  open,
  onOpenChange,
  hobbyId,
  run,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  run?: Run;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<RunInput>({
    resolver: zodResolver(runSchema) as unknown as Resolver<RunInput>,
    values: toDefaults(run),
  });

  async function onSubmit(values: RunInput) {
    setSubmitting(true);
    const result = await saveRun(hobbyId, values, run?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(run ? "Run updated" : "Run logged");
    router.refresh();
    onOpenChange(false);
    if (!run) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{run ? "Edit run" : "Log a run"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredOn">Date</Label>
            <Input id="occurredOn" type="date" {...register("occurredOn")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="distanceKm">Distance (km)</Label>
              <Input id="distanceKm" type="number" step="0.01" min="0" {...register("distanceKm")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="durationMinutes">Time (min)</Label>
              <Input id="durationMinutes" type="number" step="0.5" min="0" {...register("durationMinutes")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="route">Route (optional)</Label>
            <Input id="route" {...register("route")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feeling">How it felt (optional)</Label>
            <Input id="feeling" placeholder="Easy, steady, hard…" {...register("feeling")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} placeholder="Optional" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : run ? "Save changes" : "Log run"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
