import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/services/profile";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");
  if (session.profile?.onboarded_at) redirect("/dashboard");

  return (
    <OnboardingWizard
      fullName={session.profile?.full_name || session.user.email?.split("@")[0] || "there"}
      initialSeasons={session.profile?.onboarding_seasons ?? []}
    />
  );
}
