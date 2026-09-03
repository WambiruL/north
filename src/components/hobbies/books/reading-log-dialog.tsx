"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { readingLogSchema, type ReadingLogInput } from "@/lib/validation/books";
import { saveReadingLog } from "@/server/actions/books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function ReadingLogDialog({
  open,
  onOpenChange,
  hobbyId,
  bookId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  bookId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ReadingLogInput>({
    resolver: zodResolver(readingLogSchema) as unknown as Resolver<ReadingLogInput>,
    defaultValues: { occurredOn: dateISOInTimezone(detectTimezone()), note: "" },
  });

  async function onSubmit(values: ReadingLogInput) {
    setSubmitting(true);
    const result = await saveReadingLog(hobbyId, bookId, values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Added to your reading log");
    router.refresh();
    onOpenChange(false);
    reset({ occurredOn: dateISOInTimezone(detectTimezone()), note: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a reading log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="page">Page (optional)</Label>
              <Input id="page" type="number" min="0" {...register("page")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">What stood out</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="Finally got through the first three chapters…"
              {...register("note")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
