import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database.types";
import type {
  ExperienceInput,
  MilestoneInput,
  GoalInput,
  SeasonInput,
  MapStepInput,
  StatementInput,
  MentorInput,
  ReflectionInput,
  OpportunityInput,
} from "@/lib/validation/career";
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
      season_id: input.seasonId ?? null,
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
      season_id: input.seasonId ?? null,
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
      kind: input.kind ?? null,
      tags: input.tags,
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
      kind: input.kind ?? null,
      tags: input.tags,
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
      progress: input.progress,
      next_step: input.nextStep ?? null,
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
      progress: input.progress,
      next_step: input.nextStep ?? null,
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

// ---------- Seasons ----------

export async function listSeasons(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_seasons")
    .select("*")
    .eq("user_id", userId)
    .order("start_year", { ascending: false });
  return data ?? [];
}

export async function createSeason(supabase: Client, userId: string, input: SeasonInput) {
  const { data, error } = await supabase
    .from("career_seasons")
    .insert({
      user_id: userId,
      title: input.title,
      chapter: input.chapter ?? null,
      start_year: input.startYear,
      end_year: input.isCurrent ? null : input.endYear ?? null,
      is_current: input.isCurrent,
      description: input.description ?? null,
      wins: input.wins,
      lessons: input.lessons ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "career",
    verb: "added a season",
    summary: input.title,
    entityTable: "career_seasons",
    entityId: data.id,
  });

  return data;
}

export async function updateSeason(supabase: Client, userId: string, id: string, input: SeasonInput) {
  const { data, error } = await supabase
    .from("career_seasons")
    .update({
      title: input.title,
      chapter: input.chapter ?? null,
      start_year: input.startYear,
      end_year: input.isCurrent ? null : input.endYear ?? null,
      is_current: input.isCurrent,
      description: input.description ?? null,
      wins: input.wins,
      lessons: input.lessons ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSeason(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("career_seasons").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Career map steps ----------

export async function listMapSteps(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_map_steps")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createMapStep(supabase: Client, userId: string, input: MapStepInput) {
  const { data, error } = await supabase
    .from("career_map_steps")
    .insert({ user_id: userId, stage: input.stage, label: input.label, note: input.note ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMapStep(
  supabase: Client,
  userId: string,
  id: string,
  input: MapStepInput,
) {
  const { data, error } = await supabase
    .from("career_map_steps")
    .update({ stage: input.stage, label: input.label, note: input.note ?? null })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMapStep(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("career_map_steps")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Statements (identity + legacy share a shape) ----------

export async function listStatements(supabase: Client, userId: string, context: "identity" | "legacy") {
  const { data } = await supabase
    .from("career_statements")
    .select("*")
    .eq("user_id", userId)
    .eq("context", context)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createStatement(supabase: Client, userId: string, input: StatementInput) {
  const { data, error } = await supabase
    .from("career_statements")
    .insert({
      user_id: userId,
      context: input.context,
      kind: input.kind,
      statement: input.statement,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateStatement(
  supabase: Client,
  userId: string,
  id: string,
  input: StatementInput,
) {
  const { data, error } = await supabase
    .from("career_statements")
    .update({ context: input.context, kind: input.kind, statement: input.statement })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteStatement(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("career_statements")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Mentors ----------

export async function listMentors(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_mentors")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createMentor(supabase: Client, userId: string, input: MentorInput) {
  const { data, error } = await supabase
    .from("career_mentors")
    .insert({
      user_id: userId,
      name: input.name,
      role: input.role ?? null,
      how_helped: input.howHelped ?? null,
      lesson: input.lesson ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMentor(supabase: Client, userId: string, id: string, input: MentorInput) {
  const { data, error } = await supabase
    .from("career_mentors")
    .update({
      name: input.name,
      role: input.role ?? null,
      how_helped: input.howHelped ?? null,
      lesson: input.lesson ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMentor(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("career_mentors").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Reflections ----------

export async function listReflections(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createReflection(supabase: Client, userId: string, input: ReflectionInput) {
  const { data, error } = await supabase
    .from("career_reflections")
    .insert({ user_id: userId, prompt: input.prompt, body: input.body })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateReflection(
  supabase: Client,
  userId: string,
  id: string,
  input: ReflectionInput,
) {
  const { data, error } = await supabase
    .from("career_reflections")
    .update({ prompt: input.prompt, body: input.body })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteReflection(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("career_reflections")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Opportunities (archive) ----------

export async function listOpportunities(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_opportunities")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  return data ?? [];
}

export async function createOpportunity(supabase: Client, userId: string, input: OpportunityInput) {
  const { data, error } = await supabase
    .from("career_opportunities")
    .insert({
      user_id: userId,
      occurred_on: input.occurredOn,
      what: input.what,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOpportunity(
  supabase: Client,
  userId: string,
  id: string,
  input: OpportunityInput,
) {
  const { data, error } = await supabase
    .from("career_opportunities")
    .update({ occurred_on: input.occurredOn, what: input.what, note: input.note ?? null })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOpportunity(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("career_opportunities")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Profile (mission statement) ----------

export async function getCareerMission(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("career_profile")
    .select("mission")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.mission ?? "";
}

export async function saveCareerMission(supabase: Client, userId: string, mission: string) {
  const { error } = await supabase
    .from("career_profile")
    .upsert({ user_id: userId, mission: mission || null }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

// ---------- Computed hero facts ----------

export function computeCareerFacts(
  experiences: Tables<"career_experiences">[],
  skills: Tables<"skills">[],
) {
  const orgs = new Set(experiences.map((e) => e.organization));
  const earliestStart = experiences.reduce<string | null>((min, e) => {
    if (!min || e.start_date < min) return e.start_date;
    return min;
  }, null);

  let yearsLabel = "—";
  if (earliestStart) {
    const years = (Date.now() - new Date(earliestStart).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    yearsLabel = years < 1 ? "Under a year" : `${Math.floor(years)} years`;
  }

  return [
    { label: "Time on record", value: yearsLabel },
    { label: "Roles", value: experiences.length ? String(experiences.length) : "—" },
    { label: "Organizations", value: orgs.size ? String(orgs.size) : "—" },
    { label: "Skills tracked", value: skills.length ? String(skills.length) : "—" },
  ];
}
