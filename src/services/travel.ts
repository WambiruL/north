import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { TravelEntryInput } from "@/lib/validation/travel";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listTravelEntries(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("travel_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("occurred_on", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTravelEntry(
  supabase: Client,
  userId: string,
  hobbyId: string,
  input: TravelEntryInput,
) {
  const { data, error } = await supabase
    .from("travel_entries")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      title: input.title,
      status: input.status,
      location: input.location ?? null,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      occurred_on: input.occurredOn ?? null,
      image_urls: input.imageUrls,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: input.status === "been" ? "visited" : "wants to visit",
    summary: input.title,
    entityTable: "travel_entries",
    entityId: data.id,
  });

  return data;
}

export async function updateTravelEntry(
  supabase: Client,
  userId: string,
  id: string,
  input: TravelEntryInput,
) {
  const { data, error } = await supabase
    .from("travel_entries")
    .update({
      title: input.title,
      status: input.status,
      location: input.location ?? null,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      occurred_on: input.occurredOn ?? null,
      image_urls: input.imageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTravelEntry(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("travel_entries").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
