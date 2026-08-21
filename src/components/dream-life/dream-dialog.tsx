"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dreamSchema, type DreamInput } from "@/lib/validation/dream-life";
import { saveDream } from "@/server/actions/dream-life";
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

type Dream = Tables<"dreams">;
type LifeArea = Tables<"life_areas">;

const HORIZON_LABELS: Record<DreamInput["horizon"], string> = {
  this_year: "This year",
  "1_3_years": "1-3 years",
  someday: "Someday",
};

export interface DreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dream?: Dream;
  lifeAreas: LifeArea[];
}

function toDefaults(dream?: Dream): DreamInput {
  if (dream) {
    return {
      title: dream.title,
      description: dream.description ?? undefined,
      horizon: (dream.horizon as DreamInput["horizon"]) ?? "someday",
      lifeAreaId: dream.life_area_id ?? undefined,
      imageUrl: dream.image_url ?? undefined,
    };
  }
  return {
    title: "",
    description: "",
    horizon: "this_year",
    lifeAreaId: undefined,
    imageUrl: "",
  };
}

export function DreamDialog({ open, onOpenChange, dream, lifeAreas }: DreamDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<DreamInput>({
    resolver: zodResolver(dreamSchema),
    values: toDefaults(dream),
  });

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{dream ? "Edit dream" : "What does the life you're building look like?"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="A cabin by the water" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                      {(Object.keys(HORIZON_LABELS) as DreamInput["horizon"][]).map((h) => (
                        <SelectItem key={h} value={h}>
                          {HORIZON_LABELS[h]}
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
