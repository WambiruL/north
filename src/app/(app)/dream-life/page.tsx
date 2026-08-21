import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listLifeAreas, listDreamsWithGoals, listVisionItems } from "@/services/dream-life";
import { DreamLifeClient } from "@/components/dream-life/dream-life-client";

export const metadata: Metadata = { title: "Dream Life" };

export default async function DreamLifePage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [lifeAreas, dreams, visionItems] = user
    ? await Promise.all([
        listLifeAreas(supabase, user.id),
        listDreamsWithGoals(supabase, user.id),
        listVisionItems(supabase, user.id),
      ])
    : [[], [], []];

  return (
    <DreamLifeClient
      lifeAreas={lifeAreas}
      dreams={dreams}
      visionItems={visionItems}
      autoOpen={newParam === "dream_goal" ? "dream_goal" : undefined}
    />
  );
}
