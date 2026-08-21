"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  collectionSchema,
  COLLECTION_ICON_SHAPES,
  type CollectionFormValues,
} from "@/lib/validation/collections";
import { saveCollection } from "@/server/actions/collections";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mark } from "@/components/ui/mark";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Collection = Tables<"collections">;

export interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection;
}

function toDefaults(collection?: Collection): CollectionFormValues {
  if (collection) {
    return {
      name: collection.name,
      description: collection.description ?? undefined,
      iconMark: (collection.icon_mark as CollectionFormValues["iconMark"]) ?? "circle",
    };
  }
  return { name: "", description: "", iconMark: "circle" };
}

export function CollectionDialog({ open, onOpenChange, collection }: CollectionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    values: toDefaults(collection),
  });

  async function onSubmit(values: CollectionFormValues) {
    setSubmitting(true);
    const result = await saveCollection(
      {
        name: values.name,
        description: values.description,
        iconMark: values.iconMark ?? "circle",
      },
      collection?.id,
    );
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(collection ? "Collection updated" : "Collection created");
    onOpenChange(false);
    if (!collection) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{collection ? "Edit collection" : "New collection"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Reading list" {...register("name")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="What's this for?"
              {...register("description")}
            />
          </div>

          <Controller
            control={control}
            name="iconMark"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label>Icon</Label>
                <div className="flex gap-2">
                  {COLLECTION_ICON_SHAPES.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => field.onChange(shape)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-[10px] border transition-colors",
                        field.value === shape
                          ? "border-teal bg-teal-soft"
                          : "border-line bg-raise hover:bg-surface-2",
                      )}
                      aria-label={shape}
                      aria-pressed={field.value === shape}
                    >
                      <Mark shape={shape} tone="ink" size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : collection ? "Save changes" : "Create collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
