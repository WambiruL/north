"use client";

import { useState } from "react";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  sessionSchema,
  type SessionInput,
  type SessionFormInput,
} from "@/lib/validation/learning";
import { saveSession } from "@/server/actions/learning";
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

type Session = Tables<"learning_sessions">;
type Skill = Tables<"skills">;

export interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session;
  skills: Skill[];
}

const NONE = "__none__";

function toDefaults(session?: Session): SessionInput {
  if (session) {
    return {
      skillId: session.skill_id ?? undefined,
      occurredOn: session.occurred_on,
      minutes: session.minutes,
      note: session.note ?? undefined,
    };
  }
  return {
    skillId: undefined,
    occurredOn: dateISOInTimezone(detectTimezone()),
    minutes: 30,
    note: undefined,
  };
}

export function SessionDialog({ open, onOpenChange, session, skills }: SessionDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<
    SessionFormInput,
    unknown,
    SessionInput
  >({
    resolver: zodResolver(sessionSchema),
    values: toDefaults(session),
  });

  async function onSubmit(values: SessionInput) {
    setSubmitting(true);
    const result = await saveSession(values, session?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(session ? "Session updated" : "Session logged");
    router.refresh();
    onOpenChange(false);
    if (!session) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{session ? "Edit session" : "Log a session"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {skills.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Skill</Label>
              <Controller
                control={control}
                name="skillId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not tied to a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Not tied to a skill</SelectItem>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minutes">Minutes</Label>
              <Input id="minutes" type="number" min="1" {...register("minutes")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">What you worked on</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : session ? "Save changes" : "Log session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
