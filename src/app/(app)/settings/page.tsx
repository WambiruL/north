import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/services/profile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { signOut } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");
  const { user, profile } = session;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-[13.5px] text-muted">Your account, your appearance, your call.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <span className="text-[13.5px] text-muted">Signed in as</span>
          <span className="text-[14px] font-semibold text-ink">{user.email}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <form action={signOut} className="self-start">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
