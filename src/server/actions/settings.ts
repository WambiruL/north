"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validation/settings";

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
      city: parsed.data.city || null,
      timezone: parsed.data.timezone,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
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
