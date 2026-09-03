import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { RecipeInput, CookingLogInput } from "@/lib/validation/cooking";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listRecipes(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listCookingLogs(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("cooking_logs")
    .select("*, recipe:recipes(id, name)")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecipeDetail(supabase: Client, userId: string, id: string) {
  const [{ data: recipe, error }, { data: logs }] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    supabase
      .from("cooking_logs")
      .select("*")
      .eq("recipe_id", id)
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false }),
  ]);
  if (error) throw new Error(error.message);
  if (!recipe) return null;
  return { recipe, logs: logs ?? [] };
}

export async function createRecipe(supabase: Client, userId: string, hobbyId: string, input: RecipeInput) {
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      name: input.name,
      photo_url: input.photoUrl ?? null,
      ingredients: input.ingredients ?? null,
      method: input.method ?? null,
      prep_minutes: input.prepMinutes ?? null,
      cook_minutes: input.cookMinutes ?? null,
      notes: input.notes ?? null,
      rating: input.rating ?? null,
      status: input.status,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: "saved a recipe for",
    summary: input.name,
    entityTable: "recipes",
    entityId: data.id,
  });

  return data;
}

export async function updateRecipe(supabase: Client, userId: string, id: string, input: RecipeInput) {
  const { data, error } = await supabase
    .from("recipes")
    .update({
      name: input.name,
      photo_url: input.photoUrl ?? null,
      ingredients: input.ingredients ?? null,
      method: input.method ?? null,
      prep_minutes: input.prepMinutes ?? null,
      cook_minutes: input.cookMinutes ?? null,
      notes: input.notes ?? null,
      rating: input.rating ?? null,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRecipe(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createCookingLog(
  supabase: Client,
  userId: string,
  hobbyId: string,
  input: CookingLogInput,
) {
  const { data, error } = await supabase
    .from("cooking_logs")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      recipe_id: input.recipeId ?? null,
      dish_name: input.dishName,
      photo_url: input.photoUrl ?? null,
      occurred_on: input.occurredOn,
      rating: input.rating ?? null,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: "cooked",
    summary: input.dishName,
    entityTable: "cooking_logs",
    entityId: data.id,
  });

  return data;
}

export async function deleteCookingLog(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("cooking_logs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
