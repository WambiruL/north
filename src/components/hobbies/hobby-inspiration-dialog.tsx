"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inspirationItemSchema, type InspirationItemInput } from "@/lib/validation/creative";
import { saveHobbyInspiration } from "@/server/actions/hobbies";
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

export interface HobbyInspirationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
}

function defaults(): InspirationItemInput {
  return { title: "", sourceUrl: undefined, imageUrl: undefined, note: undefined, kind: undefined };
}

export function HobbyInspirationDialog({ open, onOpenChange, hobbyId }: HobbyInspirationDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<InspirationItemInput>({
    resolver: zodResolver(inspirationItemSchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: InspirationItemInput) {
    setSubmitting(true);
    const result = await saveHobbyInspiration(hobbyId, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Kept for later");
    router.refresh();
    onOpenChange(false);
    reset(defaults());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keep inspiration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What is it?" {...register("title")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kind">Kind</Label>
            <Input id="kind" placeholder="e.g. Photo, palette, reference" {...register("kind")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input id="sourceUrl" placeholder="Where did you find it?" {...register("sourceUrl")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" placeholder="Paste an image URL" {...register("imageUrl")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Why it&apos;s here</Label>
            <Textarea id="note" rows={2} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : "Keep it"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
