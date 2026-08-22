"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { manifestoPrincipleSchema, type ManifestoPrincipleInput } from "@/lib/validation/dream-life";
import { saveManifestoPrinciple } from "@/server/actions/dream-life";
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

type ManifestoPrinciple = Tables<"manifesto_principles">;

export interface ManifestoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  principle?: ManifestoPrinciple;
}

function toDefaults(principle?: ManifestoPrinciple): ManifestoPrincipleInput {
  if (principle) {
    return { kind: principle.kind, text: principle.text };
  }
  return { kind: "", text: "" };
}

export function ManifestoDialog({ open, onOpenChange, principle }: ManifestoDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ManifestoPrincipleInput>({
    resolver: zodResolver(manifestoPrincipleSchema),
    values: toDefaults(principle),
  });

  async function onSubmit(values: ManifestoPrincipleInput) {
    setSubmitting(true);
    const result = await saveManifestoPrinciple(values, principle?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(principle ? "Principle updated" : "Principle added");
    router.refresh();
    onOpenChange(false);
    if (!principle) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{principle ? "Edit principle" : "Add a principle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kind">Label</Label>
            <Input id="kind" placeholder="Non-negotiable, Boundary, Trade-off I've made…" {...register("kind")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="text">The principle</Label>
            <Textarea
              id="text"
              rows={4}
              placeholder="What you believe, stated plainly."
              {...register("text")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : principle ? "Save changes" : "Add principle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
