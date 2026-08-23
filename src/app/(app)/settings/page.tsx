import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/services/profile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { PreferencesCard } from "@/components/settings/preferences-card";
import { AccountCard } from "@/components/settings/account-card";
import type { PreferencesInput } from "@/lib/validation/settings";

export const metadata: Metadata = { title: "Settings" };

const DEFAULT_PREFERENCES: PreferencesInput = {
  reduceMotion: false,
  openCheckInAfterSignIn: false,
  showSeasonCard: true,
  homeDensity: "full",
};

export default async function SettingsPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");
  const { user, profile } = session;

  const preferences: PreferencesInput = {
    ...DEFAULT_PREFERENCES,
    ...(profile?.preferences as Partial<PreferencesInput> | undefined),
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-[13.5px] text-muted">Your account, and how North behaves.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <AvatarUpload fullName={profile?.full_name || "You"} avatarUrl={profile?.avatar_url ?? null} />
          {profile && <ProfileForm profile={profile} />}
        </CardContent>
      </Card>

      <AppearanceCard />
      <PreferencesCard preferences={preferences} />
      <AccountCard email={user.email ?? ""} />
    </div>
  );
}
