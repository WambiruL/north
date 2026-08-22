import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getTodayCheckIn } from "@/services/check-ins";
import { listProjectsWithTaskCounts, listFocusTasks, listWins } from "@/services/work";
import { listPathsWithCourses, listProjects as listLearningProjects, getLearningFocus } from "@/services/learning";
import { getFinancialSnapshot } from "@/services/finances";
import { listDreamsWithGoals } from "@/services/dream-life";
import { listHobbiesWithCounts } from "@/services/hobbies";
import { listSeasons, listGoals as listCareerGoals } from "@/services/career";
import { getRecentActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 5) return "You're up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export async function getDashboardData(supabase: Client, userId: string, name: string) {
  const [
    todayCheckIn,
    projects,
    focusTasks,
    paths,
    learningProjects,
    learningFocus,
    snapshot,
    dreams,
    hobbies,
    seasons,
    careerGoals,
    activity,
    wins,
  ] = await Promise.all([
    getTodayCheckIn(supabase, userId),
    listProjectsWithTaskCounts(supabase, userId),
    listFocusTasks(supabase, userId),
    listPathsWithCourses(supabase, userId),
    listLearningProjects(supabase, userId),
    getLearningFocus(supabase, userId),
    getFinancialSnapshot(supabase, userId),
    listDreamsWithGoals(supabase, userId),
    listHobbiesWithCounts(supabase, userId),
    listSeasons(supabase, userId),
    listCareerGoals(supabase, userId),
    getRecentActivity(supabase, userId, 8),
    listWins(supabase, userId),
  ]);

  const activeProjects = projects.filter((p) => p.status === "active");

  const allCourses = paths.flatMap((p) => p.courses);
  const learningProgress =
    allCourses.length > 0
      ? Math.round(allCourses.reduce((sum, c) => sum + c.progress, 0) / allCourses.length)
      : 0;

  const activeDreamGoals = dreams
    .flatMap((d) => d.goals.map((g) => ({ ...g, dreamTitle: d.title })))
    .filter((g) => !g.is_done);

  const now = new Date();

  const currentSeason = seasons.find((s) => s.is_current) ?? null;
  const topCareerGoal = careerGoals.find((g) => g.status === "active") ?? null;

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const weeklyWins = [
    ...wins
      .filter((w) => new Date(w.occurred_on) >= weekAgo)
      .map((w) => w.title),
    ...activity
      .filter(
        (a) =>
          new Date(a.occurred_at) >= weekAgo &&
          (a.verb.includes("completed") || a.verb.includes("achieved")),
      )
      .map((a) => a.summary),
  ].slice(0, 6);

  const upcoming = [
    ...focusTasks
      .filter((t) => t.due_date)
      .map((t) => ({ when: t.due_date as string, what: t.title, detail: t.work_project?.name ?? "Work" })),
    ...careerGoals
      .filter((g) => g.target_date && g.status === "active")
      .map((g) => ({ when: g.target_date as string, what: g.title, detail: "Career goal" })),
    ...activeDreamGoals
      .filter((g) => g.target_date)
      .map((g) => ({ when: g.target_date as string, what: g.title, detail: g.dreamTitle })),
    ...snapshot.savingsGoals
      .filter((g) => g.target_date)
      .map((g) => ({ when: g.target_date as string, what: g.name, detail: "Savings goal" })),
  ]
    .sort((a, b) => a.when.localeCompare(b.when))
    .slice(0, 5);

  const snapshotTiles = [
    {
      label: "Career",
      value: activeProjects.length ? `${activeProjects.length} active` : "—",
      detail: currentSeason?.title ?? (careerGoals.length ? `${careerGoals.length} goals` : "Not started"),
      href: "/career",
    },
    {
      label: "Learning",
      value: `${learningProgress}%`,
      detail: learningFocus || "No focus set",
      href: "/learning",
    },
    {
      label: "Work",
      value: String(activeProjects.length),
      detail: activeProjects.length ? "projects in motion" : "Nothing active",
      href: "/work",
    },
    {
      label: "Finances",
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
        snapshot.totalBalance,
      ),
      detail: `${snapshot.savingsGoals.length} savings goals`,
      href: "/finances",
    },
    {
      label: "Hobbies",
      value: String(hobbies.length),
      detail: hobbies.length ? "in rotation" : "None yet",
      href: "/hobbies",
    },
    {
      label: "Dream life",
      value: String(activeDreamGoals.length),
      detail: "goals in motion",
      href: "/dream-life",
    },
  ];

  const resume = activity.slice(0, 4).map((a) => ({
    id: a.id,
    module: a.module,
    text: a.summary,
    when: a.occurred_at,
  }));

  return {
    greeting: greetingFor(now),
    name,
    today: now,
    todayCheckIn,
    focusTasks: focusTasks.slice(0, 3),
    snapshotTiles,
    currentSeason,
    topCareerGoal,
    recentActivity: activity,
    weeklyWins,
    upcoming,
    resume,
    learningProjectsInProgress: learningProjects.filter((p) => p.progress > 0 && p.progress < 100).length,
  };
}
