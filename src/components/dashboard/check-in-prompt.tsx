import Link from "next/link";
import { Card } from "@/components/ui/card";
import { moodLevel } from "@/lib/constants/mood";
import type { Tables } from "@/types/database.types";

export function CheckInPrompt({ todayCheckIn }: { todayCheckIn: Tables<"check_ins"> | null }) {
  if (todayCheckIn) {
    const mood = moodLevel(todayCheckIn.mood);
    return (
      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Today</span>
            <div className="mt-1 text-[24px] font-bold tracking-tight text-ink">{mood.label}</div>
          </div>
          <Link href="/check-ins" className="text-[13px] font-bold text-teal hover:text-amber">
            Edit today
          </Link>
        </div>
        <div className="text-[13px] font-semibold text-muted">
          Energy {todayCheckIn.energy}/5
          {todayCheckIn.sleep_hours != null && ` · ${todayCheckIn.sleep_hours} hours`}
        </div>
        {todayCheckIn.feeling && (
          <p className="border-l-2 border-line pl-3 text-[13.5px] italic leading-relaxed text-muted">
            {todayCheckIn.feeling}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-6">
      <h2 className="text-[20px] font-bold tracking-tight text-ink">
        Sit with the day for a minute before you close it.
      </h2>
      <p className="text-[13.5px] text-muted">You haven&apos;t checked in yet today.</p>
      <Link
        href="/check-ins"
        className="mt-1 self-start rounded-[10px] bg-amber px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        Check in
      </Link>
    </Card>
  );
}
