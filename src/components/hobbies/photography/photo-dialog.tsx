"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { photoSchema, type PhotoInput } from "@/lib/validation/photography";
import { savePhoto } from "@/server/actions/photography";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/hobbies/shared/image-upload";

type PhotoSeries = Tables<"photo_series">;

const NO_SERIES = "__none__";

export function PhotoDialog({
  open,
  onOpenChange,
  hobbyId,
  series,
  defaultSeriesId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  series: PhotoSeries[];
  defaultSeriesId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<PhotoInput>({
    resolver: zodResolver(photoSchema) as unknown as Resolver<PhotoInput>,
    defaultValues: {
      imageUrl: "",
      caption: "",
      location: "",
      occurredOn: dateISOInTimezone(detectTimezone()),
      seriesId: defaultSeriesId ?? null,
      isFavorite: false,
    },
  });

  async function onSubmit(values: PhotoInput) {
    setSubmitting(true);
    const result = await savePhoto(hobbyId, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Photo added");
    router.refresh();
    onOpenChange(false);
    reset({
      imageUrl: "",
      caption: "",
      location: "",
      occurredOn: dateISOInTimezone(detectTimezone()),
      seriesId: defaultSeriesId ?? null,
      isFavorite: false,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={(url) => field.onChange(url ?? "")} label="Add a photo" aspect="aspect-[4/3]" />
            )}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" {...register("caption")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
          </div>
          {series.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Series (optional)</Label>
              <Controller
                control={control}
                name="seriesId"
                render={({ field }) => (
                  <Select value={field.value ?? NO_SERIES} onValueChange={(v) => field.onChange(v === NO_SERIES ? null : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SERIES}>No series</SelectItem>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : "Add photo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
