"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { opportunitySchema, type OpportunityInput } from "@/lib/validation/career";
import { saveOpportunity } from "@/server/actions/career";
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

type Opportunity = Tables<"career_opportunities">;

export interface OpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity;
}

function toDefaults(opportunity?: Opportunity): OpportunityInput {
  if (opportunity) {
    return {
      occurredOn: opportunity.occurred_on,
      what: opportunity.what,
      note: opportunity.note ?? undefined,
    };
  }
  return { occurredOn: new Date().toISOString().slice(0, 10), what: "", note: undefined };
}

export function OpportunityDialog({ open, onOpenChange, opportunity }: OpportunityDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema),
    values: toDefaults(opportunity),
  });

  async function onSubmit(values: OpportunityInput) {
    setSubmitting(true);
    const result = await saveOpportunity(values, opportunity?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(opportunity ? "Entry updated" : "Entry added");
    router.refresh();
    onOpenChange(false);
    if (!opportunity) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Edit entry" : "Add an entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredOn">When it came up</Label>
            <Input id="occurredOn" type="date" {...register("occurredOn")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="what">What it was</Label>
            <Input id="what" placeholder="An offer to lead design at a seed-stage startup" {...register("what")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">What happened, and why</Label>
            <Textarea id="note" rows={4} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : opportunity ? "Save changes" : "Add entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
