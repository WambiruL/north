"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  learningPathSchema,
  courseSchema,
  resourceSchema,
  type LearningPathInput,
  type CourseInput,
  type ResourceInput,
} from "@/lib/validation/learning";
import * as learningService from "@/services/learning";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveLearningPath(input: LearningPathInput, id?: string) {
  const parsed = learningPathSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await learningService.updateLearningPath(supabase, userId, id, parsed.data);
    } else {
      await learningService.createLearningPath(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/learning");
  return {};
}

export async function removeLearningPath(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteLearningPath(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveCourse(input: CourseInput, id?: string) {
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await learningService.updateCourse(supabase, userId, id, parsed.data);
    } else {
      await learningService.createCourse(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/learning");
  return {};
}

export async function removeCourse(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteCourse(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveResource(input: ResourceInput, id?: string) {
  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await learningService.updateResource(supabase, userId, id, parsed.data);
    } else {
      await learningService.createResource(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/learning");
  return {};
}

export async function removeResource(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteResource(supabase, userId, id);
  revalidatePath("/learning");
}
