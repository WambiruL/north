"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  lifeAreaSchema,
  dreamSchema,
  dreamGoalSchema,
  visionItemSchema,
  type LifeAreaInput,
  type DreamInput,
  type DreamGoalInput,
  type VisionItemInput,
} from "@/lib/validation/dream-life";
import * as dreamLifeService from "@/services/dream-life";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

// ---------- life areas ----------

export async function saveLifeArea(input: LifeAreaInput, id?: string) {
  const parsed = lifeAreaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateLifeArea(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createLifeArea(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeLifeArea(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteLifeArea(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- dreams ----------

export async function saveDream(input: DreamInput, id?: string) {
  const parsed = dreamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateDream(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createDream(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeDream(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteDream(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- dream goals ----------

export async function saveDreamGoal(input: DreamGoalInput, id?: string) {
  const parsed = dreamGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateDreamGoal(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createDreamGoal(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function toggleDreamGoalDone(id: string, isDone: boolean) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.setDreamGoalDone(supabase, userId, id, isDone);
  revalidatePath("/dream-life");
}

export async function removeDreamGoal(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteDreamGoal(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- vision items ----------

export async function saveVisionItem(input: VisionItemInput, id?: string) {
  const parsed = visionItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateVisionItem(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createVisionItem(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeVisionItem(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteVisionItem(supabase, userId, id);
  revalidatePath("/dream-life");
}
