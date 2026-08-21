"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckInDialog } from "@/components/check-ins/check-in-dialog";
import { pickReflectionPrompt } from "@/lib/constants/reflection-prompts";
import type { Tables } from "@/types/database.types";

const MOOD_WORDS: Record<number, string> = { 1: "Rough", 2: "Low", 3: "Steady", 4: "Good", 5: "Great" };

export function CheckInPrompt({ todayCheckIn }: { todayCheckIn: Tables<"check_ins"> | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-3 p-6">
      {todayCheckIn ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-tight text-ink">Today&apos;s check-in</h2>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            <span>Mood · {MOOD_WORDS[todayCheckIn.mood]}</span>
            <span>Energy · {todayCheckIn.energy}/5</span>
            <span>Stress · {todayCheckIn.stress}/5</span>
          </div>
          {todayCheckIn.reflection && (
            <p className="border-l-2 border-line pl-3 text-[13.5px] italic leading-relaxed text-muted">
              {todayCheckIn.reflection}
            </p>
          )}
        </>
      ) : (
        <>
          <h2 className="text-[20px] font-bold tracking-tight text-ink">{pickReflectionPrompt()}</h2>
          <p className="text-[13.5px] text-muted">
            {format(parseISO(new Date().toISOString()), "EEEE, d MMMM")} — you haven&apos;t checked in yet.
          </p>
          <Button variant="accent" className="self-start" onClick={() => setOpen(true)}>
            Check in
          </Button>
        </>
      )}
      <CheckInDialog open={open} onOpenChange={setOpen} checkIn={todayCheckIn ?? undefined} />
    </Card>
  );
}
