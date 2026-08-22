"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  creativeProjectSchema,
  type CreativeProjectInput,
  creativeIdeaSchema,
  type CreativeIdeaInput,
  inspirationItemSchema,
  type InspirationItemInput,
  moodboardSchema,
  type MoodboardInput,
  projectEntrySchema,
  type ProjectEntryInput,
} from "@/lib/validation/creative";
import * as creativeService from "@/services/creative";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveProject(input: CreativeProjectInput, id?: string) {
  const parsed = creativeProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await creativeService.updateProject(supabase, userId, id, parsed.data);
    } else {
      await creativeService.createProject(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/creative-studio");
  if (id) revalidatePath(`/creative-studio/${id}`);
  return {};
}

export async function removeProject(id: string) {
  const { supabase, userId } = await requireUser();
  await creativeService.deleteProject(supabase, userId, id);
  revalidatePath("/creative-studio");
}

export async function saveIdea(input: CreativeIdeaInput, id?: string) {
  const parsed = creativeIdeaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await creativeService.updateIdea(supabase, userId, id, parsed.data);
    } else {
      await creativeService.createIdea(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/creative-studio");
  return {};
}

export async function removeIdea(id: string) {
  const { supabase, userId } = await requireUser();
  await creativeService.deleteIdea(supabase, userId, id);
  revalidatePath("/creative-studio");
}

export async function promoteIdeaAction(ideaId: string, projectTitle: string) {
  const title = projectTitle.trim();
  if (!title) {
    return { error: "Title is required" };
  }

  const { supabase, userId } = await requireUser();

  try {
    await creativeService.promoteIdea(supabase, userId, ideaId, title);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/creative-studio");
  return {};
}

export async function saveInspirationItem(input: InspirationItemInput) {
  const parsed = inspirationItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    await creativeService.createInspirationItem(supabase, userId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/creative-studio");
  return {};
}

export async function removeInspirationItem(id: string) {
  const { supabase, userId } = await requireUser();
  await creativeService.deleteInspirationItem(supabase, userId, id);
  revalidatePath("/creative-studio");
}

export async function saveMoodboard(input: MoodboardInput, id?: string) {
  const parsed = moodboardSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await creativeService.updateMoodboard(supabase, userId, id, parsed.data);
    } else {
      await creativeService.createMoodboard(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/creative-studio");
  return {};
}

export async function removeMoodboard(id: string) {
  const { supabase, userId } = await requireUser();
  await creativeService.deleteMoodboard(supabase, userId, id);
  revalidatePath("/creative-studio");
}

export async function saveProjectEntry(
  projectId: string,
  projectTitle: string,
  input: ProjectEntryInput,
  id?: string,
) {
  const parsed = projectEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await creativeService.updateProjectEntry(supabase, userId, id, parsed.data);
    } else {
      await creativeService.createProjectEntry(supabase, userId, projectId, projectTitle, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/creative-studio/${projectId}`);
  return {};
}

export async function removeProjectEntry(projectId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await creativeService.deleteProjectEntry(supabase, userId, id);
  revalidatePath(`/creative-studio/${projectId}`);
}
