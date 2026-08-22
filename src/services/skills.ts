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
      level_label: input.levelLabel ?? null,
      next_step: input.nextStep ?? null,
      evidence: input.evidence ?? null,
      hours_logged: input.hoursLogged ?? 0,
      growth_steps: input.growthSteps ?? [],
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
      level_label: input.levelLabel ?? null,
      next_step: input.nextStep ?? null,
      evidence: input.evidence ?? null,
      hours_logged: input.hoursLogged ?? 0,
      growth_steps: input.growthSteps ?? [],
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

/** Groups skills by their category label for grouped displays (Learning's skill map). */
export function groupSkillsByCategory<T extends { category: string | null }>(skills: T[]) {
  const groups = new Map<string, T[]>();
  for (const skill of skills) {
    const key = skill.category?.trim() || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(skill);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
}
