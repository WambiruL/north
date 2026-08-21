"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, Moon } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckInDialog } from "@/components/check-ins/check-in-dialog";
import { removeCheckIn } from "@/server/actions/check-ins";

type CheckIn = Tables<"check_ins">;

const MOOD_WORDS: Record<number, string> = { 1: "Rough", 2: "Low", 3: "Steady", 4: "Good", 5: "Great" };

export function CheckInsClient({
  checkIns,
  autoOpen,
}: {
  checkIns: CheckIn[];
  autoOpen: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(autoOpen);
  const [editing, setEditing] = useState<CheckIn | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(checkIn: CheckIn) {
    setEditing(checkIn);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeCheckIn(id);
    toast.success("Check-in deleted");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Check-ins</h1>
          <p className="mt-1 text-[13.5px] text-muted">A quiet daily record of how you actually are.</p>
        </div>
        <Button variant="accent" onClick={openNew}>
          New check-in
        </Button>
      </div>

      {checkIns.length === 0 ? (
        <EmptyState
          title="No check-ins yet"
          description="Start a daily habit of noticing your mood, energy, and stress. It only takes a minute."
          action={
            <Button variant="accent" onClick={openNew}>
              Check in for today
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-bold text-ink">
                    {format(parseISO(checkIn.entry_date), "EEEE, d MMMM")}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted">
                    <span>Mood · {MOOD_WORDS[checkIn.mood]}</span>
                    <span>Energy · {checkIn.energy}/5</span>
                    <span>Stress · {checkIn.stress}/5</span>
                    {checkIn.sleep_hours != null && (
                      <span className="inline-flex items-center gap-1">
                        <Moon className="h-3 w-3" /> {checkIn.sleep_hours}h
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(checkIn)} aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(checkIn.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {checkIn.reflection && (
                <p className="border-l-2 border-line pl-3 text-[13.5px] italic leading-relaxed text-muted">
                  {checkIn.reflection_prompt && (
                    <span className="mr-1 not-italic font-semibold text-ink">
                      {checkIn.reflection_prompt}
                    </span>
                  )}
                  {checkIn.reflection}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <CheckInDialog open={dialogOpen} onOpenChange={setDialogOpen} checkIn={editing} />
    </div>
  );
}
