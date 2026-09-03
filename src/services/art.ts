import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ArtworkInput } from "@/lib/validation/art";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listArtworks(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createArtwork(supabase: Client, userId: string, hobbyId: string, input: ArtworkInput) {
  const { data, error } = await supabase
    .from("artworks")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      title: input.title,
      image_url: input.imageUrl ?? null,
      medium: input.medium ?? null,
      dimensions: input.dimensions ?? null,
      notes: input.notes ?? null,
      status: input.status,
      occurred_on: input.occurredOn,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: "added artwork",
    summary: input.title,
    entityTable: "artworks",
    entityId: data.id,
  });

  return data;
}

export async function updateArtwork(supabase: Client, userId: string, id: string, input: ArtworkInput) {
  const { data, error } = await supabase
    .from("artworks")
    .update({
      title: input.title,
      image_url: input.imageUrl ?? null,
      medium: input.medium ?? null,
      dimensions: input.dimensions ?? null,
      notes: input.notes ?? null,
      status: input.status,
      occurred_on: input.occurredOn,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteArtwork(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("artworks").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
