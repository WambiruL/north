"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  hobbySchema,
  type HobbyInput,
  hobbyProjectSchema,
  type HobbyProjectInput,
  hobbyMemorySchema,
  type HobbyMemoryInput,
} from "@/lib/validation/hobbies";
import * as hobbyService from "@/services/hobbies";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveHobby(input: HobbyInput, id?: string) {
  const parsed = hobbySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await hobbyService.updateHobby(supabase, userId, id, parsed.data);
    } else {
      await hobbyService.createHobby(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/hobbies");
  if (id) revalidatePath(`/hobbies/${id}`);
  return {};
}

export async function removeHobby(id: string) {
  const { supabase, userId } = await requireUser();
  await hobbyService.deleteHobby(supabase, userId, id);
  revalidatePath("/hobbies");
}

export async function saveHobbyProject(hobbyId: string, input: HobbyProjectInput, id?: string) {
  const parsed = hobbyProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await hobbyService.updateHobbyProject(supabase, userId, id, parsed.data);
    } else {
      await hobbyService.createHobbyProject(supabase, userId, hobbyId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  return {};
}

export async function removeHobbyProject(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await hobbyService.deleteHobbyProject(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}

export async function saveHobbyMemory(
  hobbyId: string,
  hobbyName: string,
  input: HobbyMemoryInput,
) {
  const parsed = hobbyMemorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    await hobbyService.createHobbyMemory(supabase, userId, hobbyId, hobbyName, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  return {};
}

export async function removeHobbyMemory(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await hobbyService.deleteHobbyMemory(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}
