"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { skillSchema, type SkillInput } from "@/lib/validation/skills";
import * as skillService from "@/services/skills";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveSkill(input: SkillInput) {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    const skill = await skillService.createSkill(supabase, userId, parsed.data);
    revalidatePath("/learning");
    return { skill };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function editSkill(id: string, input: SkillInput) {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    const skill = await skillService.updateSkill(supabase, userId, id, parsed.data);
    revalidatePath("/learning");
    return { skill };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function removeSkill(id: string) {
  const { supabase, userId } = await requireUser();
  await skillService.deleteSkill(supabase, userId, id);
  revalidatePath("/learning");
}
