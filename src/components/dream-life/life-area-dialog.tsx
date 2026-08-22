"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { lifeAreaSchema, type LifeAreaInput } from "@/lib/validation/dream-life";
import { saveLifeArea } from "@/server/actions/dream-life";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type LifeArea = Tables<"life_areas">;

export interface LifeAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lifeArea?: LifeArea;
}

function toDefaults(lifeArea?: LifeArea): LifeAreaInput {
  if (lifeArea) {
    return {
      name: lifeArea.name,
      question: lifeArea.question ?? undefined,
      belief: lifeArea.belief ?? undefined,
      practices: lifeArea.practices.map((p) => p),
    };
  }
  return { name: "", question: "", belief: "", practices: [] };
}

export function LifeAreaDialog({ open, onOpenChange, lifeArea }: LifeAreaDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<LifeAreaInput>({
    resolver: zodResolver(lifeAreaSchema),
    values: toDefaults(lifeArea),
  });

  async function onSubmit(values: LifeAreaInput) {
    setSubmitting(true);
    const result = await saveLifeArea(values, lifeArea?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(lifeArea ? "Life area updated" : "Life area added");
    router.refresh();
    onOpenChange(false);
    if (!lifeArea) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lifeArea ? "Edit life area" : "New life area"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Health, Family, Craft…" {...register("name")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="question">The question you&rsquo;re answering here</Label>
            <Input
              id="question"
              placeholder="What does healthy actually mean to me?"
              {...register("question")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="belief">What I believe, and what I will not trade</Label>
            <Textarea
              id="belief"
              rows={4}
              placeholder="The non-negotiable truth that guides this area of your life."
              {...register("belief")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="practices">What that means in practice</Label>
            <Controller
              control={control}
              name="practices"
              render={({ field }) => (
                <Textarea
                  id="practices"
                  rows={4}
                  placeholder={"One per line, e.g.\nMove my body most days\nSleep before midnight"}
                  value={(field.value ?? []).join("\n")}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : lifeArea ? "Save changes" : "Add life area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
