"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { visionItemSchema, type VisionItemInput } from "@/lib/validation/dream-life";
import { saveVisionItem } from "@/server/actions/dream-life";
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

type VisionItem = Tables<"vision_items">;
type Dream = Tables<"dreams">;

export interface VisionItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visionItem?: VisionItem;
  dreams: Dream[];
}

function toDefaults(visionItem?: VisionItem): VisionItemInput {
  if (visionItem) {
    return {
      caption: visionItem.caption,
      imageUrl: visionItem.image_url ?? undefined,
      dreamId: visionItem.dream_id ?? undefined,
    };
  }
  return { caption: "", imageUrl: "", dreamId: undefined };
}

export function VisionItemDialog({ open, onOpenChange, visionItem, dreams }: VisionItemDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<VisionItemInput>({
    resolver: zodResolver(visionItemSchema),
    values: toDefaults(visionItem),
  });

  async function onSubmit(values: VisionItemInput) {
    setSubmitting(true);
    const result = await saveVisionItem(values, visionItem?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(visionItem ? "Vision item updated" : "Added to vision board");
    onOpenChange(false);
    if (!visionItem) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{visionItem ? "Edit vision item" : "Add to your vision board"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" placeholder="Paste an image URL" {...register("imageUrl")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" placeholder="What this image means to you" {...register("caption")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dreamId">Linked dream</Label>
            <Controller
              control={control}
              name="dreamId"
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                >
                  <SelectTrigger id="dreamId">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
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

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : visionItem ? "Save changes" : "Add to board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
