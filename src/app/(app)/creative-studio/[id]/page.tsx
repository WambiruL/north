import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const project = await getProjectDetail(supabase, user.id, id);
  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
