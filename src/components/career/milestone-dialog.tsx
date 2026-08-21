"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { milestoneSchema, type MilestoneInput } from "@/lib/validation/career";
import { saveMilestone } from "@/server/actions/career";
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

type Milestone = Tables<"career_milestones">;
type Experience = Tables<"career_experiences">;

export interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: Milestone;
  experiences: Experience[];
}

const NONE = "__none__";

function toDefaults(milestone?: Milestone): MilestoneInput {
  if (milestone) {
    return {
      title: milestone.title,
      description: milestone.description ?? undefined,
      occurredOn: milestone.occurred_on,
      experienceId: milestone.experience_id ?? undefined,
    };
  }
  return {
    title: "",
    description: undefined,
    occurredOn: new Date().toISOString().slice(0, 10),
    experienceId: undefined,
  };
}

export function MilestoneDialog({ open, onOpenChange, milestone, experiences }: MilestoneDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<MilestoneInput>({
    resolver: zodResolver(milestoneSchema),
    values: toDefaults(milestone),
  });

  async function onSubmit(values: MilestoneInput) {
    setSubmitting(true);
    const result = await saveMilestone(values, milestone?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(milestone ? "Milestone updated" : "Milestone added");
    onOpenChange(false);
    if (!milestone) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{milestone ? "Edit milestone" : "Add a milestone"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Shipped the redesign" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredOn">Date</Label>
            <Input id="occurredOn" type="date" {...register("occurredOn")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          {experiences.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Related experience</Label>
              <Controller
                control={control}
                name="experienceId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {experiences.map((exp) => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.title} · {exp.organization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : milestone ? "Save changes" : "Add milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
