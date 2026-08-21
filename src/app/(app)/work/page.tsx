import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listProjectsWithTaskCounts, listClients } from "@/services/work";
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

  const [projects, clients] = user
    ? await Promise.all([
        listProjectsWithTaskCounts(supabase, user.id),
        listClients(supabase, user.id),
      ])
    : [[], []];

  const autoOpen = newParam === "project" ? "project" : newParam === "task" ? "task" : null;

  return <WorkClient projects={projects} clients={clients} autoOpen={autoOpen} />;
}
