import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { RunInput } from "@/lib/validation/running";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listRuns(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function computeRunStats(runs: { distance_km: number; duration_minutes: number; occurred_on: string }[]) {
  const now = new Date();
  const monthAgoISO = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().slice(0, 10);

  const totalDistance = runs.reduce((sum, r) => sum + Number(r.distance_km), 0);
  const runsThisMonth = runs.filter((r) => r.occurred_on >= monthAgoISO).length;
  const longestRun = runs.reduce((max, r) => Math.max(max, Number(r.distance_km)), 0);
  const bestPace = runs.reduce((best: number | null, r) => {
    const pace = Number(r.duration_minutes) / Number(r.distance_km);
    if (!Number.isFinite(pace) || pace <= 0) return best;
    return best === null ? pace : Math.min(best, pace);
  }, null);

  return { totalDistance, runsThisMonth, longestRun, bestPace };
}

export async function createRun(supabase: Client, userId: string, hobbyId: string, input: RunInput) {
  const { data, error } = await supabase
    .from("runs")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      occurred_on: input.occurredOn,
      distance_km: input.distanceKm,
      duration_minutes: input.durationMinutes,
      route: input.route ?? null,
      feeling: input.feeling ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: "ran",
    summary: `${input.distanceKm}km`,
    entityTable: "runs",
    entityId: data.id,
  });

  return data;
}

export async function updateRun(supabase: Client, userId: string, id: string, input: RunInput) {
  const { data, error } = await supabase
    .from("runs")
    .update({
      occurred_on: input.occurredOn,
      distance_km: input.distanceKm,
      duration_minutes: input.durationMinutes,
      route: input.route ?? null,
      feeling: input.feeling ?? null,
      notes: input.notes ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRun(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("runs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
