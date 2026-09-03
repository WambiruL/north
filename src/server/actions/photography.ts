"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  photoSchema,
  photoSeriesSchema,
  type PhotoInput,
  type PhotoSeriesInput,
} from "@/lib/validation/photography";
import * as photoService from "@/services/photography";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function savePhoto(hobbyId: string, input: PhotoInput, id?: string) {
  const parsed = photoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    if (id) await photoService.updatePhoto(supabase, userId, id, parsed.data);
    else await photoService.createPhoto(supabase, userId, hobbyId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  return {};
}

export async function removePhoto(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await photoService.deletePhoto(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}

export async function toggleFavoritePhoto(hobbyId: string, id: string, isFavorite: boolean) {
  const { supabase, userId } = await requireUser();
  await photoService.toggleFavoritePhoto(supabase, userId, id, isFavorite);
  revalidatePath(`/hobbies/${hobbyId}`);
}

export async function savePhotoSeries(hobbyId: string, input: PhotoSeriesInput) {
  const parsed = photoSeriesSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    await photoService.createPhotoSeries(supabase, userId, hobbyId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  return {};
}

export async function removePhotoSeries(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await photoService.deletePhotoSeries(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}
