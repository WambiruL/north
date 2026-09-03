"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { artworkSchema, artworkStatuses, type ArtworkInput } from "@/lib/validation/art";
import { saveArtwork } from "@/server/actions/art";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/hobbies/shared/image-upload";

type Artwork = Tables<"artworks">;

const STATUS_LABEL: Record<(typeof artworkStatuses)[number], string> = {
  current: "In progress",
  finished: "Finished",
  idea: "Idea",
};

function toDefaults(artwork?: Artwork): ArtworkInput {
  if (artwork) {
    return {
      title: artwork.title,
      imageUrl: artwork.image_url ?? null,
      medium: artwork.medium ?? undefined,
      dimensions: artwork.dimensions ?? undefined,
      notes: artwork.notes ?? undefined,
      status: artwork.status as ArtworkInput["status"],
      occurredOn: artwork.occurred_on,
    };
  }
  return { title: "", imageUrl: null, status: "current", occurredOn: dateISOInTimezone(detectTimezone()) };
}

export function ArtworkDialog({
  open,
  onOpenChange,
  hobbyId,
  artwork,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  artwork?: Artwork;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<ArtworkInput>({
    resolver: zodResolver(artworkSchema) as unknown as Resolver<ArtworkInput>,
    values: toDefaults(artwork),
  });

  async function onSubmit(values: ArtworkInput) {
    setSubmitting(true);
    const result = await saveArtwork(hobbyId, values, artwork?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(artwork ? "Artwork updated" : "Added to your gallery");
    router.refresh();
    onOpenChange(false);
    if (!artwork) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{artwork ? "Edit artwork" : "Add artwork"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} label="Add image" aspect="aspect-[4/3]" />}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      {artworkStatuses.map((s) => (
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
              <Label htmlFor="medium">Medium</Label>
              <Input id="medium" placeholder="Watercolor, oil, pencil…" {...register("medium")} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dimensions">Dimensions (optional)</Label>
              <Input id="dimensions" {...register("dimensions")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
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
              {submitting ? "Saving…" : artwork ? "Save changes" : "Add artwork"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
