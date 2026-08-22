import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  listProjectsWithTaskCounts,
  listClients,
  listFocusTasks,
  listInvoices,
  listOpportunities,
  listWins,
  listWorkNotes,
  listContacts,
  getWorkAnalytics,
} from "@/services/work";
import { WorkClient } from "@/components/work/work-client";

export const metadata: Metadata = { title: "Work" };

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WorkClient
        projects={[]}
        clients={[]}
        focusTasks={[]}
        invoices={[]}
        opportunities={[]}
        wins={[]}
        notes={[]}
        contacts={[]}
        recentActivity={[]}
        currentEmployment={null}
        analytics={{
          activeProjects: 0,
          totalProjects: 0,
          outstanding: 0,
          paidTotal: 0,
          winsThisQuarter: 0,
          totalWins: 0,
          jobApplications: 0,
          interviewing: 0,
          openOpportunities: 0,
        }}
        autoOpen={null}
      />
    );
  }

  const [
    projects,
    clients,
    focusTasks,
    invoices,
    opportunities,
    wins,
    notes,
    contacts,
    analytics,
    { data: recentActivity },
    { data: incomeSources },
  ] = await Promise.all([
    listProjectsWithTaskCounts(supabase, user.id),
    listClients(supabase, user.id),
    listFocusTasks(supabase, user.id),
    listInvoices(supabase, user.id),
    listOpportunities(supabase, user.id),
    listWins(supabase, user.id),
    listWorkNotes(supabase, user.id),
    listContacts(supabase, user.id),
    getWorkAnalytics(supabase, user.id),
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .eq("module", "work")
      .order("occurred_at", { ascending: false })
      .limit(5),
    supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .eq("kind", "salary")
      .order("amount", { ascending: false })
      .limit(1),
  ]);

  const autoOpen = newParam === "project" ? "project" : newParam === "task" ? "task" : null;

  return (
    <WorkClient
      projects={projects}
      clients={clients}
      focusTasks={focusTasks}
      invoices={invoices}
      opportunities={opportunities}
      wins={wins}
      notes={notes}
      contacts={contacts}
      recentActivity={recentActivity ?? []}
      currentEmployment={incomeSources?.[0] ?? null}
      analytics={analytics}
      autoOpen={autoOpen}
    />
  );
}
