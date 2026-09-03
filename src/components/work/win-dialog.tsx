"use client";

import { useState } from "react";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { winSchema, type WinInput } from "@/lib/validation/work";
import { saveWin } from "@/server/actions/work";
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

type Win = Tables<"work_wins">;

export interface WinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  win?: Win;
}

function toDefaults(win?: Win): WinInput {
  if (win) {
    return {
      title: win.title,
      kind: win.kind ?? undefined,
      note: win.note ?? undefined,
      occurredOn: win.occurred_on,
    };
  }
  return { title: "", kind: "", note: "", occurredOn: dateISOInTimezone(detectTimezone()) };
}

export function WinDialog({ open, onOpenChange, win }: WinDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<WinInput>({
    resolver: zodResolver(winSchema) as unknown as Resolver<WinInput>,
    values: toDefaults(win),
  });

  async function onSubmit(values: WinInput) {
    setSubmitting(true);
    const result = await saveWin(values, win?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(win ? "Updated" : "Win logged");
    router.refresh();
    onOpenChange(false);
    if (!win) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{win ? "Edit win" : "Log a win"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">What happened</Label>
            <Input id="title" {...register("title")} placeholder="Kestrel signed the renewal" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kind">Kind</Label>
              <Input id="kind" {...register("kind")} placeholder="Delivered, referral…" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
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
              {submitting ? "Saving…" : win ? "Save changes" : "Log win"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
