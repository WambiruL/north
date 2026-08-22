import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  const preferences = profile?.preferences as { openCheckInAfterSignIn?: boolean } | null;
  redirect(preferences?.openCheckInAfterSignIn ? "/check-ins" : "/dashboard");
}
