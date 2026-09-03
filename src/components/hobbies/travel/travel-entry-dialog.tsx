"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { travelEntrySchema, travelStatuses, type TravelEntryInput } from "@/lib/validation/travel";
import { saveTravelEntry } from "@/server/actions/travel";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/hobbies/shared/image-upload";

type TravelEntry = Tables<"travel_entries">;

const STATUS_LABEL: Record<(typeof travelStatuses)[number], string> = {
  been: "I've been",
  want_to_go: "Want to go",
};

function toDefaults(entry?: TravelEntry): TravelEntryInput {
  if (entry) {
    return {
      title: entry.title,
      status: entry.status as TravelEntryInput["status"],
      location: entry.location ?? undefined,
      reason: entry.reason ?? undefined,
      notes: entry.notes ?? undefined,
      occurredOn: entry.occurred_on ?? undefined,
      imageUrls: entry.image_urls ?? [],
    };
  }
  return { title: "", status: "want_to_go", imageUrls: [] };
}

export function TravelEntryDialog({
  open,
  onOpenChange,
  hobbyId,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  entry?: TravelEntry;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset, watch, setValue } = useForm<TravelEntryInput>({
    resolver: zodResolver(travelEntrySchema) as unknown as Resolver<TravelEntryInput>,
    values: toDefaults(entry),
  });
  const status = watch("status");
  const image = watch("imageUrls")?.[0] ?? null;

  async function onSubmit(values: TravelEntryInput) {
    setSubmitting(true);
    const result = await saveTravelEntry(hobbyId, values, entry?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(entry ? "Updated" : "Added");
    router.refresh();
    onOpenChange(false);
    if (!entry) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit place" : status === "been" ? "Add a place you've been" : "Add a place"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Where is this?</Label>
            <Input id="title" placeholder="Zanzibar" {...register("title")} />
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
                    {travelStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <ImageUpload
            value={image}
            onChange={(url) => setValue("imageUrls", url ? [url] : [])}
            label="Add a photo"
            aspect="aspect-[4/3]"
          />

          {status === "been" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">When (optional)</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reason">Why (optional)</Label>
              <Input id="reason" placeholder="Recommended by a friend…" {...register("reason")} />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Optional" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : entry ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
