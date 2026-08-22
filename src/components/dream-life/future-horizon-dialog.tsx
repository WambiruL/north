"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { futureHorizonSchema, type FutureHorizonInput } from "@/lib/validation/dream-life";
import { saveFutureHorizon } from "@/server/actions/dream-life";
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

type FutureHorizon = Tables<"future_horizons">;

export interface FutureHorizonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horizon?: FutureHorizon;
}

function toDefaults(horizon?: FutureHorizon): FutureHorizonInput {
  if (horizon) {
    return {
      whenLabel: horizon.when_label,
      whereText: horizon.where_text,
      achieved: horizon.achieved ?? undefined,
      learned: horizon.learned ?? undefined,
      feels: horizon.feels ?? undefined,
    };
  }
  return { whenLabel: "", whereText: "", achieved: "", learned: "", feels: "" };
}

export function FutureHorizonDialog({ open, onOpenChange, horizon }: FutureHorizonDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<FutureHorizonInput>({
    resolver: zodResolver(futureHorizonSchema),
    values: toDefaults(horizon),
  });

  async function onSubmit(values: FutureHorizonInput) {
    setSubmitting(true);
    const result = await saveFutureHorizon(values, horizon?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(horizon ? "Horizon updated" : "Horizon added");
    router.refresh();
    onOpenChange(false);
    if (!horizon) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{horizon ? "Edit horizon" : "Add a horizon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whenLabel">When</Label>
              <Input id="whenLabel" placeholder="In 5 years" {...register("whenLabel")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whereText">Where you are</Label>
              <Input id="whereText" placeholder="Standing in the kitchen of…" {...register("whereText")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="achieved">Achieved</Label>
            <Textarea
              id="achieved"
              rows={2}
              placeholder="Write it in the past tense, as if it already happened."
              {...register("achieved")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="learned">Learned</Label>
            <Textarea id="learned" rows={2} placeholder="What did it teach you?" {...register("learned")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feels">How it feels</Label>
            <Textarea id="feels" rows={2} placeholder="Sit with it for a moment." {...register("feels")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : horizon ? "Save changes" : "Add horizon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
