"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resourceSchema, type ResourceInput } from "@/lib/validation/learning";
import { saveResource } from "@/server/actions/learning";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Resource = Tables<"learning_resources">;

export interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
}

function toDefaults(resource?: Resource): ResourceInput {
  if (resource) {
    return {
      title: resource.title,
      kind: resource.kind,
      url: resource.url ?? undefined,
      note: resource.note ?? undefined,
      isSavedForLater: resource.is_saved_for_later,
    };
  }
  return { title: "", kind: "article", url: undefined, note: undefined, isSavedForLater: true };
}

export function ResourceDialog({ open, onOpenChange, resource }: ResourceDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<ResourceInput>({
    resolver: zodResolver(resourceSchema),
    values: toDefaults(resource),
  });

  async function onSubmit(values: ResourceInput) {
    setSubmitting(true);
    const result = await saveResource(values, resource?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(resource ? "Resource updated" : "Resource saved");
    router.refresh();
    onOpenChange(false);
    if (!resource) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{resource ? "Edit resource" : "Save a resource"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="The Art of Deep Work" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kind">Kind</Label>
            <Input id="kind" placeholder="article, video, book…" {...register("kind")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://…" {...register("url")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>
          <label className="flex items-center gap-2.5">
            <Controller
              control={control}
              name="isSavedForLater"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <span className="text-[13.5px] text-ink">Save for later</span>
          </label>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : resource ? "Save changes" : "Save resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
