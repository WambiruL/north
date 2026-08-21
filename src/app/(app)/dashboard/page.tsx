import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getDashboardData } from "@/services/dashboard";
import { CheckInPrompt } from "@/components/dashboard/check-in-prompt";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PrioritiesList } from "@/components/dashboard/priorities-list";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Dashboard" };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function DashboardPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/sign-in");
  const { user, profile } = session;

  const firstName = (profile?.full_name || user.email?.split("@")[0] || "there").split(" ")[0];
  const supabase = await createClient();
  const data = await getDashboardData(supabase, user.id, firstName);

  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <div>
        <h1 className="max-w-[16em] text-[46px] font-bold leading-[1.08] tracking-tight text-ink">
          {data.greeting}, {firstName}.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <CheckInPrompt todayCheckIn={data.todayCheckIn} />

        <Card className="flex flex-col gap-3 p-6">
          <h2 className="text-[15px] font-bold text-ink">Financial snapshot</h2>
          <div className="font-display text-[30px] font-semibold text-ink">
            {currency.format(data.financialSnapshot.totalBalance)}
          </div>
          <div className="flex gap-4 text-[12.5px] text-muted">
            <span>In: {currency.format(data.financialSnapshot.monthIncome)}</span>
            <span>Out: {currency.format(data.financialSnapshot.monthExpense)}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile
          label="Active projects"
          value={String(data.projectCount)}
          detail="in Work"
          href="/work"
          tone="teal"
        />
        <StatTile
          label="Learning"
          value={`${data.learningProgress}%`}
          detail={`${data.coursesInProgress} in progress`}
          href="/learning"
          tone="teal"
        />
        <StatTile
          label="Dream goals"
          value={String(data.activeDreamGoals.length)}
          detail="in motion"
          href="/dream-life"
          tone="mahogany"
        />
        <StatTile
          label="Savings goals"
          value={String(data.financialSnapshot.savingsGoals.length)}
          detail="tracked"
          href="/finances"
          tone="teal"
        />
      </div>

      <div>
        <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">
          What matters most today?
        </h2>
        <PrioritiesList tasks={data.openTasks} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">
            Where your life stands
          </h2>
          {data.activeDreamGoals.length === 0 ? (
            <EmptyState
              title="No goals in motion"
              description="Set a goal under a dream and it'll show up here."
            />
          ) : (
            <Card className="flex flex-col divide-y divide-line-2 p-0">
              {data.activeDreamGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{goal.title}</p>
                    <p className="truncate text-[11.5px] text-faint">{goal.dreamTitle}</p>
                  </div>
                  {goal.target_date && (
                    <span className="shrink-0 text-[11.5px] text-muted">
                      {new Date(goal.target_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-[24px] font-bold tracking-tight text-ink">
            Pick up where you left off
          </h2>
          <ActivityFeed activity={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
