"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { dreamSchema, dreamHorizonLabels, type DreamInput } from "@/lib/validation/dream-life";
import { saveDream } from "@/server/actions/dream-life";
import type { DreamWithGoals } from "@/services/dream-life";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type LifeArea = Tables<"life_areas">;

export interface DreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dream?: DreamWithGoals;
  lifeAreas: LifeArea[];
}

function toDefaults(dream?: DreamWithGoals): DreamInput {
  if (dream) {
    return {
      title: dream.title,
      vision: dream.description ?? undefined,
      goalStatement: dream.goal_statement ?? undefined,
      horizon: (dream.horizon as DreamInput["horizon"]) ?? "someday",
      lifeAreaId: dream.life_area_id ?? undefined,
      imageUrl: dream.image_url ?? undefined,
      milestones: dream.milestones.map((m) => ({ id: m.id, title: m.title, isDone: m.is_done })),
      actions: dream.actions.map((a) => ({ id: a.id, title: a.title })),
    };
  }
  return {
    title: "",
    vision: "",
    goalStatement: "",
    horizon: "this_year",
    lifeAreaId: undefined,
    imageUrl: "",
    milestones: [],
    actions: [],
  };
}

export function DreamDialog({ open, onOpenChange, dream, lifeAreas }: DreamDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<DreamInput>({
    resolver: zodResolver(dreamSchema),
    values: toDefaults(dream),
  });

  const milestoneFields = useFieldArray({ control, name: "milestones" });
  const actionFields = useFieldArray({ control, name: "actions" });

  async function onSubmit(values: DreamInput) {
    setSubmitting(true);
    const result = await saveDream(values, dream?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(dream ? "Dream updated" : "Dream added");
    router.refresh();
    onOpenChange(false);
    if (!dream) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dream ? "Edit dream" : "What does the life you're building look like?"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Dream</Label>
            <Input id="title" placeholder="A cabin by the water" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              rows={3}
              placeholder="What does it actually look like, in detail?"
              {...register("vision")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goalStatement">Goal</Label>
            <Input
              id="goalStatement"
              placeholder="The concrete, measurable target"
              {...register("goalStatement")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="horizon">Horizon</Label>
              <Controller
                control={control}
                name="horizon"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="horizon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(dreamHorizonLabels) as DreamInput["horizon"][]).map((h) => (
                        <SelectItem key={h} value={h}>
                          {dreamHorizonLabels[h]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lifeAreaId">Life area</Label>
              <Controller
                control={control}
                name="lifeAreaId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                  >
                    <SelectTrigger id="lifeAreaId">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {lifeAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" placeholder="Paste an image URL" {...register("imageUrl")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Milestones</Label>
            {milestoneFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2.5">
                <Controller
                  control={control}
                  name={`milestones.${index}.isDone`}
                  render={({ field: cb }) => (
                    <Checkbox checked={cb.value ?? false} onChange={(e) => cb.onChange(e.target.checked)} />
                  )}
                />
                <Input
                  placeholder="A checkpoint on the way"
                  {...register(`milestones.${index}.title` as const)}
                />
                <button
                  type="button"
                  onClick={() => milestoneFields.remove(index)}
                  className="shrink-0 text-faint transition-colors hover:text-mahogany"
                  aria-label="Remove milestone"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => milestoneFields.append({ title: "", isDone: false })}
            >
              <Plus className="h-3 w-3" /> Add milestone
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>This week</Label>
            {actionFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2.5">
                <Input
                  placeholder="One thing you can do this week"
                  {...register(`actions.${index}.title` as const)}
                />
                <button
                  type="button"
                  onClick={() => actionFields.remove(index)}
                  className="shrink-0 text-faint transition-colors hover:text-mahogany"
                  aria-label="Remove action"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => actionFields.append({ title: "" })}
            >
              <Plus className="h-3 w-3" /> Add for this week
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : dream ? "Save changes" : "Add dream"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
