import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  getCheckInForDate,
  listOtherCheckIns,
  getMoodGrid,
  computeInsights,
} from "@/services/check-ins";
import { CheckInForm } from "@/components/check-ins/check-in-form";
import { MoodHeatmap } from "@/components/check-ins/mood-heatmap";
import { InsightsCard } from "@/components/check-ins/insights-card";
import { EntriesSidebar } from "@/components/check-ins/entries-sidebar";

export const metadata: Metadata = { title: "Check-in" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CheckInsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const entryDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayISO();
  const isToday = entryDate === todayISO();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [checkIn, otherEntries, moodGrid] = user
    ? await Promise.all([
        getCheckInForDate(supabase, user.id, entryDate),
        listOtherCheckIns(supabase, user.id, entryDate, 8),
        getMoodGrid(supabase, user.id, 35),
      ])
    : [null, [], []];

  const insights = computeInsights(otherEntries);

  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">
          {format(parseISO(entryDate), "EEEE, d MMMM")}
        </h1>
        <p className="mt-1 text-[17px] text-muted">
          {isToday
            ? "Sit with the day for a minute before you close it."
            : "Revisiting how this day went."}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CheckInForm entryDate={entryDate} isToday={isToday} checkIn={checkIn} />

        <div className="flex flex-col gap-6">
          <MoodHeatmap cells={moodGrid} />
          <InsightsCard insights={insights} />
          <EntriesSidebar entries={otherEntries} />
        </div>
      </div>
    </div>
  );
}
