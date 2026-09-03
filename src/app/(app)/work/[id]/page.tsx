import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getProjectDetail, listClients } from "@/services/work";
import { ProjectDetailClient } from "@/components/work/project-detail-client";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await getCurrentUserAndProfile();
  const user = session?.user ?? null;
  const currency = session?.profile?.currency || "USD";

  if (!user) notFound();

  const [detail, clients] = await Promise.all([
    getProjectDetail(supabase, user.id, id),
    listClients(supabase, user.id),
  ]);

  if (!detail) notFound();

  return (
    <ProjectDetailClient
      project={detail.project}
      tasks={detail.tasks}
      transactions={detail.transactions}
      clients={clients}
      currency={currency}
    />
  );
}
