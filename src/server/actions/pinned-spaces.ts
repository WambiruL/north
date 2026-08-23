"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as pinnedSpacesService from "@/services/pinned-spaces";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function pinSpace(spaceKey: string) {
  const { supabase, userId } = await requireUser();
  await pinnedSpacesService.pinSpace(supabase, userId, spaceKey);
  revalidatePath("/", "layout");
}

export async function unpinSpace(spaceKey: string) {
  const { supabase, userId } = await requireUser();
  await pinnedSpacesService.unpinSpace(supabase, userId, spaceKey);
  revalidatePath("/", "layout");
}

export async function movePinnedSpaceUp(spaceKey: string) {
  const { supabase, userId } = await requireUser();
  await pinnedSpacesService.movePinnedSpaceUp(supabase, userId, spaceKey);
  revalidatePath("/", "layout");
}
