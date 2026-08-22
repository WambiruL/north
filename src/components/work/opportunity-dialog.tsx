"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { opportunitySchema, opportunityKinds, type OpportunityInput } from "@/lib/validation/work";
import { saveOpportunity } from "@/server/actions/work";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Opportunity = Tables<"work_opportunities">;

const KIND_LABELS: Record<(typeof opportunityKinds)[number], string> = {
  job: "Job application",
  freelance: "Freelance lead",
  collab: "Collaboration",
  other: "Other",
};

export interface OpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity;
  /** Locks the kind selector, used when opened from "Add an application". */
  lockedKind?: (typeof opportunityKinds)[number];
}

function toDefaults(opportunity?: Opportunity, lockedKind?: (typeof opportunityKinds)[number]): OpportunityInput {
  if (opportunity) {
    return {
      kind: opportunity.kind as OpportunityInput["kind"],
      title: opportunity.title,
      organization: opportunity.organization ?? undefined,
      status: opportunity.status,
      dueDate: opportunity.due_date ?? undefined,
      note: opportunity.note ?? undefined,
    };
  }
  return {
    kind: lockedKind ?? "freelance",
    title: "",
    organization: "",
    status: lockedKind === "job" ? "applied" : "watching",
    dueDate: undefined,
    note: "",
  };
}

export function OpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  lockedKind,
}: OpportunityDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema) as unknown as Resolver<OpportunityInput>,
    values: toDefaults(opportunity, lockedKind),
  });

  async function onSubmit(values: OpportunityInput) {
    setSubmitting(true);
    const result = await saveOpportunity(values, opportunity?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(opportunity ? "Updated" : "Added");
    router.refresh();
    onOpenChange(false);
    if (!opportunity) reset(toDefaults(undefined, lockedKind));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Edit" : lockedKind === "job" ? "New application" : "New opportunity"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">{lockedKind === "job" ? "Role" : "Title"}</Label>
            <Input id="title" {...register("title")} placeholder="Senior Product Designer" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" {...register("organization")} placeholder="Ovist" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Input id="status" {...register("status")} placeholder="Applied, interviewing…" />
            </div>
          </div>

          {!lockedKind && (
            <div className="flex flex-col gap-1.5">
              <Label>Kind</Label>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {opportunityKinds.map((k) => (
                        <SelectItem key={k} value={k}>
                          {KIND_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dueDate">{lockedKind === "job" ? "Next interview / deadline" : "Due date"}</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Notes</Label>
            <Textarea id="note" rows={3} {...register("note")} placeholder="Optional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : opportunity ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
