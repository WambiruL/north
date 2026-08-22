"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  experienceSchema,
  milestoneSchema,
  goalSchema,
  seasonSchema,
  mapStepSchema,
  statementSchema,
  mentorSchema,
  reflectionSchema,
  opportunitySchema,
  type ExperienceInput,
  type MilestoneInput,
  type GoalInput,
  type SeasonInput,
  type MapStepInput,
  type StatementInput,
  type MentorInput,
  type ReflectionInput,
  type OpportunityInput,
} from "@/lib/validation/career";
import * as careerService from "@/services/career";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveExperience(input: ExperienceInput, id?: string) {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await careerService.updateExperience(supabase, userId, id, parsed.data);
    } else {
      await careerService.createExperience(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/career");
  return {};
}

export async function removeExperience(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteExperience(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveMilestone(input: MilestoneInput, id?: string) {
  const parsed = milestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await careerService.updateMilestone(supabase, userId, id, parsed.data);
    } else {
      await careerService.createMilestone(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/career");
  return {};
}

export async function removeMilestone(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteMilestone(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveGoal(input: GoalInput, id?: string) {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await careerService.updateGoal(supabase, userId, id, parsed.data);
    } else {
      await careerService.createGoal(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/career");
  return {};
}

export async function removeGoal(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteGoal(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveSeason(input: SeasonInput, id?: string) {
  const parsed = seasonSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await careerService.updateSeason(supabase, userId, id, parsed.data);
    } else {
      await careerService.createSeason(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}

export async function removeSeason(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteSeason(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveMapStep(input: MapStepInput, id?: string) {
  const parsed = mapStepSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await careerService.updateMapStep(supabase, userId, id, parsed.data);
    } else {
      await careerService.createMapStep(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}

export async function removeMapStep(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteMapStep(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveStatement(input: StatementInput, id?: string) {
  const parsed = statementSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await careerService.updateStatement(supabase, userId, id, parsed.data);
    } else {
      await careerService.createStatement(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}

export async function removeStatement(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteStatement(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveMentor(input: MentorInput, id?: string) {
  const parsed = mentorSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await careerService.updateMentor(supabase, userId, id, parsed.data);
    } else {
      await careerService.createMentor(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}

export async function removeMentor(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteMentor(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveReflection(input: ReflectionInput, id?: string) {
  const parsed = reflectionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await careerService.updateReflection(supabase, userId, id, parsed.data);
    } else {
      await careerService.createReflection(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}

export async function removeReflection(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteReflection(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveOpportunity(input: OpportunityInput, id?: string) {
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await careerService.updateOpportunity(supabase, userId, id, parsed.data);
    } else {
      await careerService.createOpportunity(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}

export async function removeOpportunity(id: string) {
  const { supabase, userId } = await requireUser();
  await careerService.deleteOpportunity(supabase, userId, id);
  revalidatePath("/career");
}

export async function saveMission(mission: string) {
  const { supabase, userId } = await requireUser();
  try {
    await careerService.saveCareerMission(supabase, userId, mission);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/career");
  return {};
}
