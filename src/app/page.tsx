import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/services/profile";

export default async function RootPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");

  const preferences = session.profile?.preferences as { openCheckInAfterSignIn?: boolean } | null;
  redirect(preferences?.openCheckInAfterSignIn ? "/check-ins" : "/dashboard");
}
