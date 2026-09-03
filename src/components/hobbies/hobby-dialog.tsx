"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  hobbySchema,
  type HobbyInput,
  type HobbyFormInput,
} from "@/lib/validation/hobbies";
import { HOBBY_TEMPLATE_LIST } from "@/lib/constants/hobby-templates";
import { saveHobby } from "@/server/actions/hobbies";
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
import { ImageUpload } from "@/components/hobbies/shared/image-upload";

type Hobby = Tables<"hobbies">;

export interface HobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobby?: Hobby;
  initialKind?: string;
}

function toDefaults(hobby?: Hobby, initialKind?: string): HobbyFormInput {
  return {
    name: hobby?.name ?? "",
    kind: hobby?.kind ?? initialKind ?? "other",
    description: hobby?.description ?? undefined,
    coverUrl: hobby?.cover_url ?? undefined,
    goal: hobby?.goal ?? undefined,
  };
}

export function HobbyDialog({ open, onOpenChange, hobby, initialKind }: HobbyDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<HobbyFormInput, unknown, HobbyInput>({
    resolver: zodResolver(hobbySchema),
    values: toDefaults(hobby, initialKind),
  });

  async function onSubmit(values: HobbyInput) {
    setSubmitting(true);
    const result = await saveHobby(values, hobby?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(hobby ? "Hobby updated" : "Hobby added");
    router.refresh();
    onOpenChange(false);
    if (!hobby) reset(toDefaults(undefined, initialKind));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{hobby ? "Edit hobby" : "Pick up a new hobby"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Watercolor painting" {...register("name")} />
          </div>

          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label>Kind</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOBBY_TEMPLATE_LIST.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[12.5px] text-faint">
                  Shapes what you&apos;ll log and which stats show up on the card.
                </p>
              </div>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="What draws you to it?"
              {...register("description")}
            />
          </div>

          <Controller
            control={control}
            name="coverUrl"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label>Cover (optional)</Label>
                <ImageUpload value={field.value} onChange={(url) => field.onChange(url ?? undefined)} aspect="aspect-[3/1]" />
              </div>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              placeholder="e.g. Finish twelve landscape sketches this year"
              {...register("goal")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : hobby ? "Save changes" : "Add hobby"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
