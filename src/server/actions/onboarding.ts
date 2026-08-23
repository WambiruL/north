"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingSeasonsSchema,
  onboardingAreasSchema,
  onboardingDreamSchema,
  onboardingCheckInSchema,
  type OnboardingSeasonsInput,
  type OnboardingAreasInput,
  type OnboardingDreamInput,
  type OnboardingCheckInInput,
} from "@/lib/validation/onboarding";
import { preferencesSchema, type PreferencesInput } from "@/lib/validation/settings";
import { seedInitialPins } from "@/services/pinned-spaces";
import { upsertCheckIn } from "@/services/check-ins";
import { createDream } from "@/services/dream-life";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveOnboardingSeasons(input: OnboardingSeasonsInput) {
  const parsed = onboardingSeasonsSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_seasons: parsed.data.seasons })
    .eq("id", userId);
  if (error) return { error: error.message };
  return {};
}

export async function saveOnboardingAreas(input: OnboardingAreasInput) {
  const parsed = onboardingAreasSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    await seedInitialPins(supabase, userId, parsed.data.spaceKeys);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  return {};
}

export async function addOnboardingDream(input: OnboardingDreamInput) {
  const parsed = onboardingDreamSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    const dream = await createDream(supabase, userId, {
      title: parsed.data.title,
      horizon: "someday",
    });
    return { dream };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function saveOnboardingCheckIn(input: OnboardingCheckInInput) {
  const parsed = onboardingCheckInSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    await upsertCheckIn(supabase, userId, {
      entryDate: new Date().toISOString().slice(0, 10),
      mood: parsed.data.mood,
      energy: 3,
      feeling: parsed.data.note,
      tags: [],
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  return {};
}

export async function saveOnboardingPersonalization(preferences: PreferencesInput) {
  const parsed = preferencesSchema.safeParse(preferences);
  if (!parsed.success) return { error: "Invalid input" };

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("profiles").update({ preferences: parsed.data }).eq("id", userId);
  if (error) return { error: error.message };
  return {};
}

export async function completeOnboarding() {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
