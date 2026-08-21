import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHobbyDetail } from "@/services/hobbies";
import { HobbyDetailClient } from "@/components/hobbies/hobby-detail-client";

export const metadata: Metadata = { title: "Hobby" };

export default async function HobbyDetailPage({
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

  const detail = await getHobbyDetail(supabase, user.id, id);
  if (!detail) notFound();

  return (
    <HobbyDetailClient
      hobby={detail.hobby}
      projects={detail.projects}
      memories={detail.memories}
    />
  );
}
