"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  collectionItemSchema,
  type CollectionItemFormValues,
} from "@/lib/validation/collections";
import { saveCollectionItem } from "@/server/actions/collections";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type CollectionItem = Tables<"collection_items">;

export interface CollectionItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  item?: CollectionItem;
}

function toDefaults(item?: CollectionItem): CollectionItemFormValues {
  if (item) {
    return {
      title: item.title,
      note: item.note ?? undefined,
      url: item.url ?? undefined,
      isDone: item.is_done,
      priority: (item.priority as CollectionItemFormValues["priority"]) ?? null,
    };
  }
  return { title: "", note: "", url: "", isDone: false, priority: null };
}

export function CollectionItemDialog({
  open,
  onOpenChange,
  collectionId,
  item,
}: CollectionItemDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset, setFocus } = useForm<CollectionItemFormValues>({
    resolver: zodResolver(collectionItemSchema),
    values: toDefaults(item),
  });

  async function onSubmit(values: CollectionItemFormValues) {
    setSubmitting(true);
    const result = await saveCollectionItem(
      collectionId,
      {
        title: values.title,
        note: values.note,
        url: values.url as string | undefined,
        isDone: values.isDone ?? false,
        priority: values.priority ?? null,
      },
      item?.id,
    );
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
    if (item) {
      toast.success("Item updated");
      onOpenChange(false);
      return;
    }
    toast.success("Item added — keep going or press Done");
    reset(toDefaults(undefined));
    setFocus("title");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add an item"}</DialogTitle>
          {!item && (
            <DialogDescription>Add as many as you like, then press Done.</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What do you want to remember?" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} placeholder="Any details worth keeping" {...register("note")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">Link</Label>
            <Input id="url" placeholder="https://…" {...register("url")} />
          </div>

          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            control={control}
            name="isDone"
            render={({ field }) => (
              <label className="flex items-center gap-2.5 text-[13.5px] text-ink">
                <Checkbox
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                Already done
              </label>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {item ? "Cancel" : "Done"}
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : item ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
