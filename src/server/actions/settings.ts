"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  profileSchema,
  preferencesSchema,
  type ProfileInput,
  type PreferencesInput,
} from "@/lib/validation/settings";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validation/auth";
import { isValidTimezone } from "@/lib/timezone";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function updateProfile(input: ProfileInput) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      headline: parsed.data.headline || null,
      city: parsed.data.city || null,
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

export async function updatePreferences(input: PreferencesInput) {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: parsed.data })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Silently corrects an unconfigured "UTC" timezone to the browser's real
 * one. Only ever touches the default — once a user has picked a timezone
 * (in Settings, or a non-UTC one at signup), this never overwrites it.
 */
export async function syncTimezone(timezone: string) {
  if (!isValidTimezone(timezone)) return { error: "Invalid timezone" };

  const { supabase, userId } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .single();

  if (!profile || profile.timezone !== "UTC" || timezone === "UTC") return {};

  const { error } = await supabase.from("profiles").update({ timezone }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function changePassword(input: UpdatePasswordInput) {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  return {};
}

export async function exportMyData() {
  const { supabase, userId } = await requireUser();

  const [profile, checkIns, notes, collections, collectionItems] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("check_ins").select("*").eq("user_id", userId),
    supabase.from("notes").select("*").eq("user_id", userId),
    supabase.from("collections").select("*").eq("user_id", userId),
    supabase.from("collection_items").select("*").eq("user_id", userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    checkIns: checkIns.data ?? [],
    notes: notes.data ?? [],
    collections: collections.data ?? [],
    collectionItems: collectionItems.data ?? [],
  };
}

export async function deleteMyAccount() {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: error.message };
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function updateAvatar(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file" };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: `${publicUrl.publicUrl}?t=${Date.now()}` })
    .eq("id", userId);

  if (profileError) return { error: profileError.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}
