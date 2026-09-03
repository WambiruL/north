"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runSchema, type RunInput } from "@/lib/validation/running";
import * as runningService from "@/services/running";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveRun(hobbyId: string, input: RunInput, id?: string) {
  const parsed = runSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    if (id) await runningService.updateRun(supabase, userId, id, parsed.data);
    else await runningService.createRun(supabase, userId, hobbyId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}`);
  return {};
}

export async function removeRun(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await runningService.deleteRun(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}
