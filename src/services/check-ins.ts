import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CheckInInput } from "@/lib/validation/check-ins";
import { logActivity } from "@/services/activity";
import { dateISOInTimezone, dateISODaysAgoInTimezone } from "@/lib/timezone";

type Client = SupabaseClient<Database>;
type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];

export async function listCheckIns(supabase: Client, userId: string, limit = 30) {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getCheckInForDate(supabase: Client, userId: string, date: string) {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .maybeSingle();
  return data;
}

export async function getLatestCheckIn(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getTodayCheckIn(supabase: Client, userId: string, timezone: string) {
  return getCheckInForDate(supabase, userId, dateISOInTimezone(timezone));
}

export async function listOtherCheckIns(
  supabase: Client,
  userId: string,
  excludeDate: string,
  limit = 8,
) {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .neq("entry_date", excludeDate)
    .order("entry_date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export interface MoodGridCell {
  date: string;
  mood: number | null;
}

export async function getMoodGrid(supabase: Client, userId: string, timezone: string, days = 35) {
  const startISO = dateISODaysAgoInTimezone(timezone, days - 1);

  const { data } = await supabase
    .from("check_ins")
    .select("entry_date, mood")
    .eq("user_id", userId)
    .gte("entry_date", startISO)
    .order("entry_date", { ascending: true });

  const byDate = new Map((data ?? []).map((row) => [row.entry_date, row.mood]));

  const cells: MoodGridCell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = dateISODaysAgoInTimezone(timezone, i);
    cells.push({ date: iso, mood: byDate.get(iso) ?? null });
  }
  return cells;
}

export async function upsertCheckIn(supabase: Client, userId: string, input: CheckInInput) {
  const { data, error } = await supabase
    .from("check_ins")
    .upsert(
      {
        user_id: userId,
        entry_date: input.entryDate,
        mood: input.mood,
        energy: input.energy,
        sleep_hours: input.sleepHours ?? null,
        intention: input.intention || null,
        feeling: input.feeling || null,
        challenge: input.challenge || null,
        grateful: input.grateful || null,
        matters_tomorrow: input.mattersTomorrow || null,
        tags: input.tags,
      },
      { onConflict: "user_id,entry_date" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "check_in",
    verb: "checked in",
    summary: `Checked in for ${input.entryDate}`,
    entityTable: "check_ins",
    entityId: data.id,
  });

  return data;
}

export async function deleteCheckIn(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("check_ins").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export interface Insight {
  text: string;
}

export function computeInsights(entries: CheckIn[]): Insight[] {
  if (entries.length < 3) return [];

  const insights: Insight[] = [];

  const byDay = new Map<number, number[]>();
  for (const entry of entries) {
    const day = new Date(entry.entry_date + "T00:00:00").getDay();
    const list = byDay.get(day) ?? [];
    list.push(entry.mood);
    byDay.set(day, list);
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let bestDay: { day: number; avg: number } | null = null;
  for (const [day, moods] of byDay) {
    if (moods.length < 2) continue;
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    if (!bestDay || avg > bestDay.avg) bestDay = { day, avg };
  }
  if (bestDay && bestDay.avg >= 3.5) {
    insights.push({ text: `${dayNames[bestDay.day]}s tend to be your brightest days.` });
  }

  const intentions = entries.map((e) => e.intention).filter((v): v is string => !!v);
  if (intentions.length >= 3) {
    const counts = new Map<string, number>();
    for (const word of intentions) {
      const key = word.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const [topWord, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topCount >= 2) {
      insights.push({ text: `"${topWord}" is the word you reach for most.` });
    }
  }

  const avgSleep = entries
    .map((e) => e.sleep_hours)
    .filter((v): v is number => v != null);
  if (avgSleep.length >= 3) {
    const mean = avgSleep.reduce((a, b) => a + b, 0) / avgSleep.length;
    insights.push({ text: `You're averaging ${mean.toFixed(1)} hours of sleep across your check-ins.` });
  }

  if (insights.length === 0) {
    insights.push({ text: `${entries.length} check-ins logged. Keep going and patterns will surface here.` });
  }

  return insights.slice(0, 3);
}
