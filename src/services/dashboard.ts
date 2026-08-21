import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getTodayCheckIn, getLatestCheckIn } from "@/services/check-ins";
import { listProjectsWithTaskCounts } from "@/services/work";
import { listPathsWithCourses } from "@/services/learning";
import { getFinancialSnapshot } from "@/services/finances";
import { listDreamsWithGoals } from "@/services/dream-life";
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
    latestCheckIn,
    projects,
    paths,
    snapshot,
    dreams,
    activity,
    { data: openTasks },
  ] = await Promise.all([
    getTodayCheckIn(supabase, userId),
    getLatestCheckIn(supabase, userId),
    listProjectsWithTaskCounts(supabase, userId),
    listPathsWithCourses(supabase, userId),
    getFinancialSnapshot(supabase, userId),
    listDreamsWithGoals(supabase, userId),
    getRecentActivity(supabase, userId, 8),
    supabase
      .from("work_tasks")
      .select("id, title, due_date, work_project_id, work_projects(name)")
      .eq("user_id", userId)
      .eq("is_done", false)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(5),
  ]);

  const activeProjects = projects.filter((p) => p.status === "active");

  const allCourses = paths.flatMap((p) => p.courses);
  const learningProgress =
    allCourses.length > 0
      ? Math.round(
          allCourses.reduce((sum, c) => sum + c.progress, 0) / allCourses.length,
        )
      : 0;

  const activeDreamGoals = dreams
    .flatMap((d) => d.goals.map((g) => ({ ...g, dreamTitle: d.title })))
    .filter((g) => !g.is_done)
    .slice(0, 5);

  const now = new Date();

  return {
    greeting: greetingFor(now),
    name,
    today: now,
    todayCheckIn,
    latestCheckIn,
    activeProjects,
    projectCount: activeProjects.length,
    learningProgress,
    coursesInProgress: allCourses.filter((c) => c.status === "in_progress").length,
    financialSnapshot: snapshot,
    activeDreamGoals,
    recentActivity: activity,
    openTasks: (openTasks ?? []) as Array<{
      id: string;
      title: string;
      due_date: string | null;
      work_project_id: string;
      work_projects: { name: string } | null;
    }>,
  };
}
