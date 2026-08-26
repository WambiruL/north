import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getProjectDetail } from "@/services/creative";
import { ProjectDetailClient } from "@/components/creative-studio/project-detail-client";

export const metadata: Metadata = { title: "Project" };

export default async function CreativeProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;

  if (!user) notFound();

  const detail = await getProjectDetail(supabase, user.id, id);
  if (!detail) notFound();

  return <ProjectDetailClient project={detail.project} entries={detail.entries} />;
}
