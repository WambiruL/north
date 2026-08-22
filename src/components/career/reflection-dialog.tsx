"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { reflectionSchema, type ReflectionInput } from "@/lib/validation/career";
import { saveReflection } from "@/server/actions/career";
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

type Reflection = Tables<"career_reflections">;

export interface ReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reflection?: Reflection;
}

function toDefaults(reflection?: Reflection): ReflectionInput {
  if (reflection) {
    return { prompt: reflection.prompt, body: reflection.body };
  }
  return { prompt: "", body: "" };
}

export function ReflectionDialog({ open, onOpenChange, reflection }: ReflectionDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ReflectionInput>({
    resolver: zodResolver(reflectionSchema),
    values: toDefaults(reflection),
  });

  async function onSubmit(values: ReflectionInput) {
    setSubmitting(true);
    const result = await saveReflection(values, reflection?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(reflection ? "Reflection updated" : "Reflection added");
    router.refresh();
    onOpenChange(false);
    if (!reflection) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{reflection ? "Edit reflection" : "Write a reflection"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt">The question you&apos;re answering</Label>
            <Input id="prompt" placeholder="What would you tell yourself five years ago?" {...register("prompt")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Your answer</Label>
            <Textarea id="body" rows={6} {...register("body")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : reflection ? "Save changes" : "Write reflection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
