import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { listPinnedSpaces } from "@/services/pinned-spaces";
import { Sidebar } from "@/components/navigation/sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Topbar } from "@/components/navigation/topbar";
import { TimezoneSync } from "@/components/settings/timezone-sync";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");

  const { profile, user } = session;
  if (!profile?.onboarded_at) redirect("/onboarding");

  const preferences = profile?.preferences as { reduceMotion?: boolean } | null;

  const supabase = await createClient();
  const pinnedSpaces = await listPinnedSpaces(supabase, user.id);

  return (
    <div
      className="flex h-screen overflow-hidden bg-bg"
      data-reduce-motion={preferences?.reduceMotion ? "true" : "false"}
    >
      <TimezoneSync currentTimezone={profile?.timezone || "UTC"} />
      <Sidebar
        fullName={profile?.full_name || user.email?.split("@")[0] || "You"}
        city={profile?.city ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        pinnedSpaces={pinnedSpaces}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto pb-20 md:pb-0">
        <Topbar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
