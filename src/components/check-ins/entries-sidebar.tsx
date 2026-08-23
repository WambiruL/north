"use client";

import { useState } from "react";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Mark } from "@/components/ui/mark";
import { EmptyState } from "@/components/ui/empty-state";
import { moodLevel } from "@/lib/constants/mood";
import { removeCheckIn } from "@/server/actions/check-ins";
import type { Tables } from "@/types/database.types";

type CheckIn = Tables<"check_ins">;

export function EntriesSidebar({ entries }: { entries: CheckIn[] }) {
  const router = useRouter();
  const [addingDate, setAddingDate] = useState(false);

  async function handleDelete(id: string) {
    await removeCheckIn(id);
    toast.success("Entry deleted");
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Earlier entries</span>
        <button
          type="button"
          onClick={() => setAddingDate((v) => !v)}
          className="text-[12.5px] font-bold text-teal transition-colors hover:text-amber"
        >
          Add one
        </button>
      </div>

      {addingDate && (
        <input
          type="date"
          autoFocus
          max={dateISOInTimezone(detectTimezone())}
          onChange={(e) => {
            if (e.target.value) router.push(`/check-ins?date=${e.target.value}`);
          }}
          className="h-9 rounded-[9px] border border-line bg-raise px-3 text-[13px] text-ink outline-none focus-visible:border-teal"
        />
      )}

      {entries.length === 0 ? (
        <EmptyState
          title="No earlier entries"
          description="Past check-ins will show up here."
          className="border-none bg-transparent p-0 py-2"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => {
            const mood = moodLevel(entry.mood);
            return (
              <div key={entry.id} className="border-b border-line-2 pb-4 last:border-0 last:pb-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <Mark tone={mood.tone} size={7} />
                  <span className="text-[13px] font-bold text-ink">
                    {format(parseISO(entry.entry_date), "d MMM")}
                  </span>
                  <span className="text-[12px] text-faint">{mood.label}</span>
                  <span className="flex-1" />
                  <Link
                    href={`/check-ins?date=${entry.entry_date}`}
                    className="text-[12px] font-bold text-faint transition-colors hover:text-teal"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="text-[12px] font-bold text-faint transition-colors hover:text-mahogany"
                  >
                    Delete
                  </button>
                </div>
                {entry.feeling && (
                  <p className="text-[13.5px] italic leading-relaxed text-muted">{entry.feeling}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
