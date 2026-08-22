"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  bucketListItemSchema,
  bucketListStatusValues,
  bucketListStatusLabels,
  type BucketListItemInput,
  type BucketListItemFormInput,
} from "@/lib/validation/dream-life";
import { saveBucketListItem } from "@/server/actions/dream-life";
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

type BucketListItem = Tables<"bucket_list_items">;

export interface BucketListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BucketListItem;
}

function toDefaults(item?: BucketListItem): BucketListItemInput {
  if (item) {
    return {
      title: item.title,
      category: item.category ?? undefined,
      why: item.why ?? undefined,
      status: item.status as BucketListItemInput["status"],
      imageUrl: item.image_url ?? undefined,
    };
  }
  return { title: "", category: "", why: "", status: "someday", imageUrl: "" };
}

export function BucketListDialog({ open, onOpenChange, item }: BucketListDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<
    BucketListItemFormInput,
    unknown,
    BucketListItemInput
  >({
    resolver: zodResolver(bucketListItemSchema),
    values: toDefaults(item),
  });

  async function onSubmit(values: BucketListItemInput) {
    setSubmitting(true);
    const result = await saveBucketListItem(values, item?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Updated" : "Added to the list");
    router.refresh();
    onOpenChange(false);
    if (!item) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add something to the list"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">What is it?</Label>
            <Input id="title" placeholder="Swim in the sea at night" {...register("title")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Travel, Adventure…" {...register("category")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bucketListStatusValues.map((s) => (
                        <SelectItem key={s} value={s}>
                          {bucketListStatusLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="why">Why</Label>
            <Textarea id="why" rows={3} placeholder="Why does this matter to you?" {...register("why")} />
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
              {submitting ? "Saving…" : item ? "Save changes" : "Add to the list"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
