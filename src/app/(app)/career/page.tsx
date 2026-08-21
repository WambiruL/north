import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listExperiencesWithSkills, listMilestones, listGoals } from "@/services/career";
import { listSkills } from "@/services/skills";
import { CareerClient } from "@/components/career/career-client";

export const metadata: Metadata = { title: "Career" };

export default async function CareerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [experiences, milestones, goals, skills] = user
    ? await Promise.all([
        listExperiencesWithSkills(supabase, user.id),
        listMilestones(supabase, user.id),
        listGoals(supabase, user.id),
        listSkills(supabase, user.id),
      ])
    : [[], [], [], []];

  return (
    <CareerClient experiences={experiences} milestones={milestones} goals={goals} skills={skills} />
  );
}
