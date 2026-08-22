"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkInSchema, type CheckInInput } from "@/lib/validation/check-ins";
import * as checkInService from "@/services/check-ins";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveCheckIn(input: CheckInInput) {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    await checkInService.upsertCheckIn(supabase, userId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/check-ins");
  revalidatePath("/dashboard");
  return {};
}

export async function removeCheckIn(id: string) {
  const { supabase, userId } = await requireUser();
  await checkInService.deleteCheckIn(supabase, userId, id);
  revalidatePath("/check-ins");
  revalidatePath("/dashboard");
}
