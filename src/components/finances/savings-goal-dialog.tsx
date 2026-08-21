"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { savingsGoalSchema, type SavingsGoalInput } from "@/lib/validation/finances";
import { saveSavingsGoal } from "@/server/actions/finances";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type SavingsGoal = Tables<"savings_goals">;

export interface SavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingsGoal;
}

function toDefaults(goal?: SavingsGoal): SavingsGoalInput {
  if (goal) {
    return {
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      savedAmount: Number(goal.saved_amount),
      targetDate: goal.target_date ?? undefined,
    };
  }
  return { name: "", targetAmount: 0, savedAmount: 0, targetDate: undefined };
}

export function SavingsGoalDialog({ open, onOpenChange, goal }: SavingsGoalDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<SavingsGoalInput>({
    resolver: zodResolver(savingsGoalSchema) as unknown as Resolver<SavingsGoalInput>,
    values: toDefaults(goal),
  });

  async function onSubmit(values: SavingsGoalInput) {
    setSubmitting(true);
    const result = await saveSavingsGoal(values, goal?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(goal ? "Goal updated" : "Goal set");
    router.refresh();
    onOpenChange(false);
    if (!goal) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit savings goal" : "New savings goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Emergency fund" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="targetAmount">Target amount</Label>
              <Input id="targetAmount" type="number" step="0.01" {...register("targetAmount")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="savedAmount">Saved so far</Label>
              <Input id="savedAmount" type="number" step="0.01" {...register("savedAmount")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetDate">Target date</Label>
            <Input id="targetDate" type="date" {...register("targetDate")} />
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
