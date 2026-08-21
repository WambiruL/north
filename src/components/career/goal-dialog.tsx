"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { goalSchema, type GoalInput } from "@/lib/validation/career";
import { saveGoal } from "@/server/actions/career";
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

type Goal = Tables<"career_goals">;

export interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
}

function toDefaults(goal?: Goal): GoalInput {
  if (goal) {
    return {
      title: goal.title,
      description: goal.description ?? undefined,
      targetDate: goal.target_date ?? undefined,
      status: (goal.status as GoalInput["status"]) ?? "active",
    };
  }
  return { title: "", description: undefined, targetDate: undefined, status: "active" };
}

export function GoalDialog({ open, onOpenChange, goal }: GoalDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    values: toDefaults(goal),
  });

  async function onSubmit(values: GoalInput) {
    setSubmitting(true);
    const result = await saveGoal(values, goal?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(goal ? "Goal updated" : "Goal added");
    onOpenChange(false);
    if (!goal) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit goal" : "Set a goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Lead a cross-functional launch" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetDate">Target date</Label>
            <Input id="targetDate" type="date" {...register("targetDate")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="achieved">Achieved</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : goal ? "Save changes" : "Set goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
