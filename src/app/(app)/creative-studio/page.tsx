import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  listProjects,
  listIdeas,
  listInspirationItems,
  listMoodboards,
  listStudioActivity,
} from "@/services/creative";
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

  const [projects, ideas, inspirationItems, moodboards, studioActivity] = user
    ? await Promise.all([
        listProjects(supabase, user.id),
        listIdeas(supabase, user.id),
        listInspirationItems(supabase, user.id),
        listMoodboards(supabase, user.id),
        listStudioActivity(supabase, user.id, 6),
      ])
    : [[], [], [], [], []];

  return (
    <CreativeStudioClient
      projects={projects}
      ideas={ideas}
      inspirationItems={inspirationItems}
      moodboards={moodboards}
      studioActivity={studioActivity}
      autoOpenIdea={newParam === "idea"}
    />
  );
}
