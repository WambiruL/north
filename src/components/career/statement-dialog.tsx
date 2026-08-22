"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { statementSchema, type StatementInput } from "@/lib/validation/career";
import { saveStatement } from "@/server/actions/career";
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

type Statement = Tables<"career_statements">;

export interface StatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement?: Statement;
  context: "identity" | "legacy";
}

function toDefaults(context: "identity" | "legacy", statement?: Statement): StatementInput {
  if (statement) {
    return { context, kind: statement.kind, statement: statement.statement };
  }
  return { context, kind: "", statement: "" };
}

const COPY = {
  identity: {
    title: { new: "Add a statement", edit: "Edit statement" },
    kindLabel: "What kind of statement is this",
    kindPlaceholder: "How colleagues describe me",
    bodyLabel: "The statement",
    bodyPlaceholder: "The person who makes the complicated thing feel obvious in hindsight.",
    action: { new: "Add statement", saved: "Statement added", updated: "Statement updated" },
  },
  legacy: {
    title: { new: "Add a legacy note", edit: "Edit legacy note" },
    kindLabel: "What kind of note is this",
    kindPlaceholder: "What I want to be true in ten years",
    bodyLabel: "The note",
    bodyPlaceholder: "That the people I worked with felt more capable after, not just more managed.",
    action: { new: "Add legacy note", saved: "Legacy note added", updated: "Legacy note updated" },
  },
} as const;

export function StatementDialog({ open, onOpenChange, statement, context }: StatementDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const copy = COPY[context];
  const { register, handleSubmit, reset } = useForm<StatementInput>({
    resolver: zodResolver(statementSchema),
    values: toDefaults(context, statement),
  });

  async function onSubmit(values: StatementInput) {
    setSubmitting(true);
    const result = await saveStatement(values, statement?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(statement ? copy.action.updated : copy.action.saved);
    router.refresh();
    onOpenChange(false);
    if (!statement) reset(toDefaults(context, undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{statement ? copy.title.edit : copy.title.new}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kind">{copy.kindLabel}</Label>
            <Input id="kind" placeholder={copy.kindPlaceholder} {...register("kind")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="statement">{copy.bodyLabel}</Label>
            <Textarea id="statement" rows={4} placeholder={copy.bodyPlaceholder} {...register("statement")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : statement ? "Save changes" : copy.action.new}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
