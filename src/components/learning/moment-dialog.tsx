"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { momentSchema, type MomentInput } from "@/lib/validation/learning";
import { saveMoment } from "@/server/actions/learning";
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

type Moment = Tables<"learning_moments">;

export interface MomentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moment?: Moment;
}

function toDefaults(moment?: Moment): MomentInput {
  if (moment) {
    return { occurredOn: moment.occurred_on, what: moment.what };
  }
  return { occurredOn: new Date().toISOString().slice(0, 10), what: "" };
}

export function MomentDialog({ open, onOpenChange, moment }: MomentDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<MomentInput>({
    resolver: zodResolver(momentSchema),
    values: toDefaults(moment),
  });

  async function onSubmit(values: MomentInput) {
    setSubmitting(true);
    const result = await saveMoment(values, moment?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(moment ? "Moment updated" : "Moment added");
    router.refresh();
    onOpenChange(false);
    if (!moment) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{moment ? "Edit moment" : "Add a moment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredOn">When</Label>
            <Input id="occurredOn" type="date" {...register("occurredOn")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="what">What happened</Label>
            <Input id="what" placeholder="Finished the typography course" {...register("what")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : moment ? "Save changes" : "Add moment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
