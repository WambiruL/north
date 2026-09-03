import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getDashboardData } from "@/services/dashboard";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { CheckInPrompt } from "@/components/dashboard/check-in-prompt";
import { FocusCards } from "@/components/dashboard/focus-cards";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ResumeCards } from "@/components/dashboard/resume-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { WinsPanel } from "@/components/dashboard/wins-panel";
import type { PreferencesInput } from "@/lib/validation/settings";

export const metadata: Metadata = { title: "Dashboard" };

const TILE_TONES = ["teal", "teal", "amber", "mahogany", "mahogany"] as const;

export default async function DashboardPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");
  const { user, profile } = session;

  const firstName = (profile?.full_name || user.email?.split("@")[0] || "there").split(" ")[0];
  const preferences: Partial<PreferencesInput> = (profile?.preferences as Partial<PreferencesInput>) ?? {};
  const density = preferences.homeDensity ?? "full";
  const showSnapshot = density !== "focused";
  const showResumeActivityWins = density === "full";

  const supabase = await createClient();
  const timezone = profile?.timezone || "UTC";
  const currency = profile?.currency || "USD";
  const data = await getDashboardData(supabase, user.id, firstName, timezone, currency);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <HeroBanner
        greeting={data.greeting}
        name={firstName}
        city={profile?.city ?? null}
        today={data.today}
        timezone={timezone}
      />

      <CheckInPrompt todayCheckIn={data.todayCheckIn} />

      <div>
        <div className="mb-4 flex items-baseline justify-between gap-5">
          <h2 className="text-[24px] font-bold tracking-tight text-ink">What matters most today?</h2>
        </div>
        <FocusCards tasks={data.focusTasks} />
      </div>

      {showSnapshot && (
        <div>
          <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">Where your life stands</h2>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
            {data.snapshotTiles.map((tile, i) => (
              <StatTile key={tile.label} {...tile} tone={TILE_TONES[i]} />
            ))}
          </div>
        </div>
      )}

      {showResumeActivityWins && (
        <>
          <ResumeCards items={data.resume} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">Lately</h2>
              <ActivityFeed activity={data.recentActivity} />
            </div>
            <div>
              <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">What is coming</h2>
              <UpcomingList items={data.upcoming} />
            </div>
          </div>

          <WinsPanel wins={data.weeklyWins} />
        </>
      )}
    </div>
  );
}
