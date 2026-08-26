import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Cached per request: the (app) layout, and every page under it, all need
 * the current user. Without this, each of those calls its own
 * supabase.auth.getUser() — a real network round trip to Supabase Auth —
 * stacking up multiple redundant round trips on a single navigation.
 * React's cache() dedupes calls with the same arguments within one render
 * pass, so only the first caller actually hits the network.
 */
export const getCurrentUserAndProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
});
