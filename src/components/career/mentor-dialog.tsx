"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { mentorSchema, type MentorInput } from "@/lib/validation/career";
import { saveMentor } from "@/server/actions/career";
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

type Mentor = Tables<"career_mentors">;

export interface MentorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor?: Mentor;
}

function toDefaults(mentor?: Mentor): MentorInput {
  if (mentor) {
    return {
      name: mentor.name,
      role: mentor.role ?? undefined,
      howHelped: mentor.how_helped ?? undefined,
      lesson: mentor.lesson ?? undefined,
    };
  }
  return { name: "", role: undefined, howHelped: undefined, lesson: undefined };
}

export function MentorDialog({ open, onOpenChange, mentor }: MentorDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<MentorInput>({
    resolver: zodResolver(mentorSchema),
    values: toDefaults(mentor),
  });

  async function onSubmit(values: MentorInput) {
    setSubmitting(true);
    const result = await saveMentor(values, mentor?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(mentor ? "Influence updated" : "Influence added");
    router.refresh();
    onOpenChange(false);
    if (!mentor) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mentor ? "Edit influence" : "Add an influence"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Priya Nair" {...register("name")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" placeholder="First design manager" {...register("role")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="howHelped">How they shaped things</Label>
            <Textarea id="howHelped" rows={3} {...register("howHelped")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson">The lesson that stuck</Label>
            <Textarea id="lesson" rows={2} {...register("lesson")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : mentor ? "Save changes" : "Add influence"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
