import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  listExperiencesWithSkills,
  listMilestones,
  listGoals,
  listSeasons,
  listMapSteps,
  listStatements,
  listMentors,
  listReflections,
  listOpportunities,
  getCareerMission,
  computeCareerFacts,
} from "@/services/career";
import { listSkills } from "@/services/skills";
import { CareerClient } from "@/components/career/career-client";

export const metadata: Metadata = { title: "Career" };

export default async function CareerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    experiences,
    milestones,
    goals,
    skills,
    seasons,
    mapSteps,
    identityStatements,
    legacyStatements,
    mentors,
    reflections,
    opportunities,
    mission,
  ] = user
    ? await Promise.all([
        listExperiencesWithSkills(supabase, user.id),
        listMilestones(supabase, user.id),
        listGoals(supabase, user.id),
        listSkills(supabase, user.id),
        listSeasons(supabase, user.id),
        listMapSteps(supabase, user.id),
        listStatements(supabase, user.id, "identity"),
        listStatements(supabase, user.id, "legacy"),
        listMentors(supabase, user.id),
        listReflections(supabase, user.id),
        listOpportunities(supabase, user.id),
        getCareerMission(supabase, user.id),
      ])
    : [[], [], [], [], [], [], [], [], [], [], [], ""];

  const careerFacts = computeCareerFacts(experiences, skills);

  return (
    <CareerClient
      experiences={experiences}
      seasons={seasons}
      milestones={milestones}
      goals={goals}
      skills={skills}
      mapSteps={mapSteps}
      identityStatements={identityStatements}
      legacyStatements={legacyStatements}
      mentors={mentors}
      reflections={reflections}
      opportunities={opportunities}
      mission={mission}
      careerFacts={careerFacts}
    />
  );
}
