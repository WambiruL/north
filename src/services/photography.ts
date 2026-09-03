import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { PhotoInput, PhotoSeriesInput } from "@/lib/validation/photography";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listPhotos(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPhotoSeries(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("photo_series")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPhoto(supabase: Client, userId: string, hobbyId: string, input: PhotoInput) {
  const { data, error } = await supabase
    .from("photos")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      series_id: input.seriesId ?? null,
      image_url: input.imageUrl,
      caption: input.caption ?? null,
      location: input.location ?? null,
      occurred_on: input.occurredOn,
      is_favorite: input.isFavorite,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: "added a photo",
    summary: input.caption || "Untitled",
    entityTable: "photos",
    entityId: data.id,
  });

  return data;
}

export async function updatePhoto(supabase: Client, userId: string, id: string, input: PhotoInput) {
  const { data, error } = await supabase
    .from("photos")
    .update({
      series_id: input.seriesId ?? null,
      image_url: input.imageUrl,
      caption: input.caption ?? null,
      location: input.location ?? null,
      occurred_on: input.occurredOn,
      is_favorite: input.isFavorite,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function toggleFavoritePhoto(supabase: Client, userId: string, id: string, isFavorite: boolean) {
  const { error } = await supabase
    .from("photos")
    .update({ is_favorite: isFavorite })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function deletePhoto(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("photos").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createPhotoSeries(
  supabase: Client,
  userId: string,
  hobbyId: string,
  input: PhotoSeriesInput,
) {
  const { data, error } = await supabase
    .from("photo_series")
    .insert({ user_id: userId, hobby_id: hobbyId, title: input.title })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePhotoSeries(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("photo_series").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
