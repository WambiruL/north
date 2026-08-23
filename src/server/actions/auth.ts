"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  signInSchema,
  requestResetSchema,
  updatePasswordSchema,
  type SignUpInput,
  type SignInInput,
  type RequestResetInput,
  type UpdatePasswordInput,
} from "@/lib/validation/auth";
import { isValidTimezone } from "@/lib/timezone";

export type ActionResult = { error: string } | { error?: undefined };
export type SignUpResult = ActionResult | { needsConfirmation: true; error?: undefined };

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const timezone =
    parsed.data.timezone && isValidTimezone(parsed.data.timezone) ? parsed.data.timezone : undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName, timezone } },
  });

  if (error) return { error: error.message };
  if (!data.session) return { needsConfirmation: true };
  redirect("/dashboard");
}

export async function signIn(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: "That email and password don't match." };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function requestPasswordReset(
  input: RequestResetInput,
): Promise<ActionResult> {
  const parsed = requestResetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password/confirm`,
  });

  if (error) return { error: error.message };
  return {};
}

export async function updatePassword(
  input: UpdatePasswordInput,
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return { error: error.message };
  redirect("/dashboard");
}
