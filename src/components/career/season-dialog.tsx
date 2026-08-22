"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { seasonSchema, type SeasonInput, type SeasonFormInput } from "@/lib/validation/career";
import { saveSeason } from "@/server/actions/career";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StringListInput } from "@/components/career/string-list-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Season = Tables<"career_seasons">;

export interface SeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season?: Season;
}

function toDefaults(season?: Season): SeasonInput {
  if (season) {
    return {
      title: season.title,
      chapter: season.chapter ?? undefined,
      startYear: season.start_year,
      endYear: season.end_year ?? undefined,
      isCurrent: season.is_current,
      description: season.description ?? undefined,
      wins: season.wins,
      lessons: season.lessons ?? undefined,
    };
  }
  return {
    title: "",
    chapter: undefined,
    startYear: new Date().getFullYear(),
    endYear: undefined,
    isCurrent: true,
    description: undefined,
    wins: [],
    lessons: undefined,
  };
}

export function SeasonDialog({ open, onOpenChange, season }: SeasonDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, watch, setValue, reset } = useForm<
    SeasonFormInput,
    unknown,
    SeasonInput
  >({
    resolver: zodResolver(seasonSchema),
    values: toDefaults(season),
  });

  const isCurrent = watch("isCurrent");
  const wins = watch("wins") ?? [];

  async function onSubmit(values: SeasonInput) {
    setSubmitting(true);
    const result = await saveSeason(values, season?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(season ? "Season updated" : "Season added");
    router.refresh();
    onOpenChange(false);
    if (!season) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{season ? "Edit season" : "Add a season"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Finding my footing" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="chapter">Chapter label</Label>
            <Input id="chapter" placeholder="The early years" {...register("chapter")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startYear">Start year</Label>
              <Input id="startYear" type="number" {...register("startYear")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endYear">End year</Label>
              <Input id="endYear" type="number" disabled={isCurrent} {...register("endYear")} />
            </div>
          </div>
          <label className="flex items-center gap-2.5">
            <Controller
              control={control}
              name="isCurrent"
              render={({ field }) => (
                <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              )}
            />
            <span className="text-[13.5px] text-ink">This is the current season</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">What this era was about</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>What happened</Label>
            <StringListInput
              value={wins}
              onChange={(next) => setValue("wins", next)}
              placeholder="A win from this season"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lessons">What it taught you</Label>
            <Textarea id="lessons" rows={3} {...register("lessons")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : season ? "Save changes" : "Add season"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
