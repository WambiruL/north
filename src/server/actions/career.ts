"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  experienceSchema,
  milestoneSchema,
  goalSchema,
  type ExperienceInput,
  type MilestoneInput,
  type GoalInput,
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
