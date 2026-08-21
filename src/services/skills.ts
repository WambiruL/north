import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { SkillInput } from "@/lib/validation/skills";

type Client = SupabaseClient<Database>;

export async function listSkills(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  return data ?? [];
}

/**
 * Upsert-friendly create: if a skill with this name already exists for the
 * user, it's returned as-is instead of erroring. Both Career and Learning
 * may want to create the same skill name.
 */
export async function createSkill(supabase: Client, userId: string, input: SkillInput) {
  const { data, error } = await supabase
    .from("skills")
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category ?? null,
      proficiency: input.proficiency ?? 1,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing, error: fetchError } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", userId)
        .eq("name", input.name)
        .single();
      if (fetchError) throw new Error(fetchError.message);
      return existing;
    }
    throw new Error(error.message);
  }

  return data;
}

export async function updateSkill(supabase: Client, userId: string, id: string, input: SkillInput) {
  const { data, error } = await supabase
    .from("skills")
    .update({
      name: input.name,
      category: input.category ?? null,
      proficiency: input.proficiency ?? 1,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSkill(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("skills").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
