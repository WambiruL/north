import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database.types";
import type { ExperienceInput, MilestoneInput, GoalInput } from "@/lib/validation/career";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

// ---------- Experiences ----------

export type ExperienceWithSkills = Tables<"career_experiences"> & {
  skills: Tables<"skills">[];
};

interface ExperienceSkillJoin {
  skill: Tables<"skills"> | null;
}

interface ExperienceRow extends Tables<"career_experiences"> {
  career_experience_skills: ExperienceSkillJoin[] | null;
}

export async function listExperiences(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_experiences")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  return data ?? [];
}

export async function listExperiencesWithSkills(
  supabase: Client,
  userId: string,
): Promise<ExperienceWithSkills[]> {
  const { data } = await supabase
    .from("career_experiences")
    .select("*, career_experience_skills(skill:skills(*))")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  return ((data as unknown as ExperienceRow[]) ?? []).map((exp) => {
    const { career_experience_skills, ...rest } = exp;
    return {
      ...rest,
      skills: (career_experience_skills ?? [])
        .map((join) => join.skill)
        .filter((s): s is Tables<"skills"> => s !== null),
    };
  });
}

export async function createExperience(supabase: Client, userId: string, input: ExperienceInput) {
  const { data, error } = await supabase
    .from("career_experiences")
    .insert({
      user_id: userId,
      title: input.title,
      organization: input.organization,
      location: input.location ?? null,
      start_date: input.startDate,
      end_date: input.isCurrent ? null : input.endDate ?? null,
      is_current: input.isCurrent,
      narrative: input.narrative ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  for (const skillId of input.skillIds) {
    await attachSkillToExperience(supabase, userId, data.id, skillId);
  }

  await logActivity(supabase, {
    userId,
    module: "career",
    verb: "added an experience",
    summary: `Added "${input.title}" at ${input.organization}`,
    entityTable: "career_experiences",
    entityId: data.id,
  });

  return data;
}

export async function updateExperience(
  supabase: Client,
  userId: string,
  id: string,
  input: ExperienceInput,
) {
  const { data, error } = await supabase
    .from("career_experiences")
    .update({
      title: input.title,
      organization: input.organization,
      location: input.location ?? null,
      start_date: input.startDate,
      end_date: input.isCurrent ? null : input.endDate ?? null,
      is_current: input.isCurrent,
      narrative: input.narrative ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("career_experience_skills")
    .delete()
    .eq("experience_id", id)
    .eq("user_id", userId);

  for (const skillId of input.skillIds) {
    await attachSkillToExperience(supabase, userId, id, skillId);
  }

  return data;
}

export async function deleteExperience(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("career_experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function attachSkillToExperience(
  supabase: Client,
  userId: string,
  experienceId: string,
  skillId: string,
) {
  const { error } = await supabase
    .from("career_experience_skills")
    .insert({ experience_id: experienceId, skill_id: skillId, user_id: userId });
  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function detachSkillFromExperience(
  supabase: Client,
  userId: string,
  experienceId: string,
  skillId: string,
) {
  const { error } = await supabase
    .from("career_experience_skills")
    .delete()
    .eq("experience_id", experienceId)
    .eq("skill_id", skillId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Milestones ----------

export async function listMilestones(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_milestones")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  return data ?? [];
}

export async function createMilestone(supabase: Client, userId: string, input: MilestoneInput) {
  const { data, error } = await supabase
    .from("career_milestones")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      occurred_on: input.occurredOn,
      experience_id: input.experienceId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "career",
    verb: "reached a milestone",
    summary: input.title,
    entityTable: "career_milestones",
    entityId: data.id,
  });

  return data;
}

export async function updateMilestone(
  supabase: Client,
  userId: string,
  id: string,
  input: MilestoneInput,
) {
  const { data, error } = await supabase
    .from("career_milestones")
    .update({
      title: input.title,
      description: input.description ?? null,
      occurred_on: input.occurredOn,
      experience_id: input.experienceId ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMilestone(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("career_milestones")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Goals ----------

export async function listGoals(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createGoal(supabase: Client, userId: string, input: GoalInput) {
  const { data, error } = await supabase
    .from("career_goals")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      target_date: input.targetDate ?? null,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "career",
    verb: "set a goal",
    summary: input.title,
    entityTable: "career_goals",
    entityId: data.id,
  });

  return data;
}

export async function updateGoal(supabase: Client, userId: string, id: string, input: GoalInput) {
  const { data, error } = await supabase
    .from("career_goals")
    .update({
      title: input.title,
      description: input.description ?? null,
      target_date: input.targetDate ?? null,
      status: input.status,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteGoal(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("career_goals").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
