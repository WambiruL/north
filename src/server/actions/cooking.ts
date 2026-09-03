"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  recipeSchema,
  cookingLogSchema,
  type RecipeInput,
  type CookingLogInput,
} from "@/lib/validation/cooking";
import * as cookingService from "@/services/cooking";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveRecipe(hobbyId: string, input: RecipeInput, id?: string) {
  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    const recipe = id
      ? await cookingService.updateRecipe(supabase, userId, id, parsed.data)
      : await cookingService.createRecipe(supabase, userId, hobbyId, parsed.data);
    revalidatePath(`/hobbies/${hobbyId}`);
    if (id) revalidatePath(`/hobbies/${hobbyId}/recipes/${id}`);
    return { id: recipe.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function removeRecipe(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await cookingService.deleteRecipe(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}

export async function saveCookingLog(hobbyId: string, input: CookingLogInput) {
  const parsed = cookingLogSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    await cookingService.createCookingLog(supabase, userId, hobbyId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  if (parsed.data.recipeId) revalidatePath(`/hobbies/${hobbyId}/recipes/${parsed.data.recipeId}`);
  return {};
}

export async function removeCookingLog(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await cookingService.deleteCookingLog(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}
