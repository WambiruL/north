"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { curiositySchema, curiosityStatusValues, type CuriosityInput } from "@/lib/validation/learning";
import { saveCuriosity } from "@/server/actions/learning";
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

type Curiosity = Tables<"learning_curiosities">;

export interface CuriosityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curiosity?: Curiosity;
}

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  exploring: "Exploring",
  parked: "Parked",
};

function toDefaults(curiosity?: Curiosity): CuriosityInput {
  if (curiosity) {
    return {
      topic: curiosity.topic,
      why: curiosity.why ?? undefined,
      status: (curiosity.status as CuriosityInput["status"]) ?? "not_started",
      resourcesGathered: curiosity.resources_gathered ?? undefined,
    };
  }
  return { topic: "", why: undefined, status: "not_started", resourcesGathered: undefined };
}

export function CuriosityDialog({ open, onOpenChange, curiosity }: CuriosityDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CuriosityInput>({
    resolver: zodResolver(curiositySchema),
    values: toDefaults(curiosity),
  });

  async function onSubmit(values: CuriosityInput) {
    setSubmitting(true);
    const result = await saveCuriosity(values, curiosity?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(curiosity ? "Curiosity updated" : "Curiosity added");
    router.refresh();
    onOpenChange(false);
    if (!curiosity) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{curiosity ? "Edit curiosity" : "Add a curiosity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" placeholder="Type design" {...register("topic")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="why">Why it caught your attention</Label>
            <Textarea id="why" rows={3} {...register("why")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {curiosityStatusValues.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resourcesGathered">Gathered so far</Label>
            <Textarea id="resourcesGathered" rows={3} {...register("resourcesGathered")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : curiosity ? "Save changes" : "Add curiosity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
