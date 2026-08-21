import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listProjects, listIdeas, listInspirationItems } from "@/services/creative";
import { CreativeStudioClient } from "@/components/creative-studio/creative-studio-client";

export const metadata: Metadata = { title: "Creative Studio" };

export default async function CreativeStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [projects, ideas, inspirationItems] = user
    ? await Promise.all([
        listProjects(supabase, user.id),
        listIdeas(supabase, user.id),
        listInspirationItems(supabase, user.id),
      ])
    : [[], [], []];

  return (
    <CreativeStudioClient
      projects={projects}
      ideas={ideas}
      inspirationItems={inspirationItems}
      autoOpenIdea={newParam === "idea"}
    />
  );
}
