"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { photoSeriesSchema, type PhotoSeriesInput } from "@/lib/validation/photography";
import { savePhotoSeries } from "@/server/actions/photography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function SeriesDialog({
  open,
  onOpenChange,
  hobbyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<PhotoSeriesInput>({
    resolver: zodResolver(photoSeriesSchema) as unknown as Resolver<PhotoSeriesInput>,
    defaultValues: { title: "" },
  });

  async function onSubmit(values: PhotoSeriesInput) {
    setSubmitting(true);
    const result = await savePhotoSeries(hobbyId, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Series created");
    router.refresh();
    onOpenChange(false);
    reset({ title: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create a series</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Name</Label>
            <Input id="title" placeholder="Nairobi at night" {...register("title")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
