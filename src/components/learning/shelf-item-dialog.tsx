"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  shelfItemSchema,
  shelfKindValues,
  shelfStatusValues,
  type ShelfItemInput,
  type ShelfItemFormInput,
} from "@/lib/validation/learning";
import { saveShelfItem } from "@/server/actions/learning";
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

type ShelfItem = Tables<"learning_resources">;

export interface ShelfItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ShelfItem;
}

const KIND_LABEL: Record<string, string> = {
  book: "Book",
  video: "Video",
  podcast: "Podcast",
  article: "Article",
  course: "Course",
};

const STATUS_LABEL: Record<string, string> = {
  queued: "On the shelf",
  in_progress: "Reading now",
  completed: "Finished",
};

function toDefaults(item?: ShelfItem): ShelfItemInput {
  if (item) {
    return {
      title: item.title,
      author: item.author ?? undefined,
      kind: (item.kind as ShelfItemInput["kind"]) ?? "book",
      status: (item.status as ShelfItemInput["status"]) ?? "queued",
      url: item.url ?? undefined,
      note: item.note ?? undefined,
      progressCurrent: item.progress_current ?? undefined,
      progressTotal: item.progress_total ?? undefined,
    };
  }
  return {
    title: "",
    author: undefined,
    kind: "book",
    status: "queued",
    url: undefined,
    note: undefined,
    progressCurrent: undefined,
    progressTotal: undefined,
  };
}

export function ShelfItemDialog({ open, onOpenChange, item }: ShelfItemDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<
    ShelfItemFormInput,
    unknown,
    ShelfItemInput
  >({
    resolver: zodResolver(shelfItemSchema),
    values: toDefaults(item),
  });

  async function onSubmit(values: ShelfItemInput) {
    setSubmitting(true);
    const result = await saveShelfItem(values, item?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Shelf item updated" : "Added to the shelf");
    router.refresh();
    onOpenChange(false);
    if (!item) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit shelf item" : "Add to the shelf"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Orbital" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author">Author or creator</Label>
            <Input id="author" placeholder="Samantha Harvey" {...register("author")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Kind</Label>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shelfKindValues.map((k) => (
                        <SelectItem key={k} value={k}>
                          {KIND_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
                      {shelfStatusValues.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="progressCurrent">Progress (current)</Label>
              <Input id="progressCurrent" type="number" min="0" {...register("progressCurrent")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="progressTotal">Out of</Label>
              <Input id="progressTotal" type="number" min="0" {...register("progressTotal")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://…" {...register("url")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : item ? "Save changes" : "Add to the shelf"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
