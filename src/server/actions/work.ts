"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  clientSchema,
  projectSchema,
  taskSchema,
  type ClientInput,
  type ProjectInput,
  type TaskInput,
} from "@/lib/validation/work";
import * as workService from "@/services/work";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateWork(projectId?: string) {
  revalidatePath("/work");
  if (projectId) revalidatePath(`/work/${projectId}`);
}

export async function saveClient(input: ClientInput, id?: string) {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateWorkClient(supabase, userId, id, parsed.data);
    } else {
      await workService.createWorkClient(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function saveProject(input: ProjectInput, id?: string) {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateProject(supabase, userId, id, parsed.data);
    } else {
      await workService.createProject(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork(id);
  return {};
}

export async function removeProject(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteProject(supabase, userId, id);
  revalidateWork();
}

export async function saveTask(workProjectId: string, input: TaskInput, id?: string) {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateTask(supabase, userId, id, parsed.data);
    } else {
      await workService.createTask(supabase, userId, workProjectId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork(workProjectId);
  return {};
}

export async function removeTask(id: string, workProjectId: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteTask(supabase, userId, id);
  revalidateWork(workProjectId);
}

export async function toggleTask(id: string, workProjectId: string) {
  const { supabase, userId } = await requireUser();
  await workService.toggleTaskDone(supabase, userId, id);
  revalidateWork(workProjectId);
}
