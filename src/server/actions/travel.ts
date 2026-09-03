"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { travelEntrySchema, type TravelEntryInput } from "@/lib/validation/travel";
import * as travelService from "@/services/travel";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveTravelEntry(hobbyId: string, input: TravelEntryInput, id?: string) {
  const parsed = travelEntrySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    if (id) await travelService.updateTravelEntry(supabase, userId, id, parsed.data);
    else await travelService.createTravelEntry(supabase, userId, hobbyId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  return {};
}

export async function removeTravelEntry(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await travelService.deleteTravelEntry(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}
