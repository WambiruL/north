import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function listPinnedSpaces(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("pinned_spaces")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function pinSpace(supabase: Client, userId: string, spaceKey: string) {
  const { data: existing } = await supabase
    .from("pinned_spaces")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (existing?.position ?? -1) + 1;

  const { error } = await supabase
    .from("pinned_spaces")
    .upsert(
      { user_id: userId, space_key: spaceKey, position: nextPosition },
      { onConflict: "user_id,space_key", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);
}

export async function unpinSpace(supabase: Client, userId: string, spaceKey: string) {
  const { error } = await supabase
    .from("pinned_spaces")
    .delete()
    .eq("user_id", userId)
    .eq("space_key", spaceKey);
  if (error) throw new Error(error.message);
}

export async function movePinnedSpaceUp(supabase: Client, userId: string, spaceKey: string) {
  const pins = await listPinnedSpaces(supabase, userId);
  const index = pins.findIndex((p) => p.space_key === spaceKey);
  if (index <= 0) return;

  const current = pins[index];
  const previous = pins[index - 1];

  await Promise.all([
    supabase
      .from("pinned_spaces")
      .update({ position: previous.position })
      .eq("id", current.id)
      .eq("user_id", userId),
    supabase
      .from("pinned_spaces")
      .update({ position: current.position })
      .eq("id", previous.id)
      .eq("user_id", userId),
  ]);
}

export async function seedInitialPins(supabase: Client, userId: string, spaceKeys: string[]) {
  if (spaceKeys.length === 0) return;
  const rows = spaceKeys.map((key, i) => ({ user_id: userId, space_key: key, position: i }));
  await supabase.from("pinned_spaces").upsert(rows, { onConflict: "user_id,space_key", ignoreDuplicates: true });
}
