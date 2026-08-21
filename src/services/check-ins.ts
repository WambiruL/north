import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CheckInInput } from "@/lib/validation/check-ins";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listCheckIns(supabase: Client, userId: string, limit = 30) {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit);
  return data ?? [];
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

export async function getTodayCheckIn(supabase: Client, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", today)
    .maybeSingle();
  return data;
}

export async function createCheckIn(supabase: Client, userId: string, input: CheckInInput) {
  const { data, error } = await supabase
    .from("check_ins")
    .upsert(
      {
        user_id: userId,
        entry_date: input.entryDate,
        mood: input.mood,
        energy: input.energy,
        stress: input.stress,
        sleep_hours: input.sleepHours ?? null,
        reflection_prompt: input.reflectionPrompt ?? null,
        reflection: input.reflection ?? null,
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

export async function updateCheckIn(
  supabase: Client,
  userId: string,
  id: string,
  input: CheckInInput,
) {
  const { data, error } = await supabase
    .from("check_ins")
    .update({
      entry_date: input.entryDate,
      mood: input.mood,
      energy: input.energy,
      stress: input.stress,
      sleep_hours: input.sleepHours ?? null,
      reflection_prompt: input.reflectionPrompt ?? null,
      reflection: input.reflection ?? null,
      tags: input.tags,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCheckIn(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("check_ins").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
