import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import {
  listPathsWithCourses,
  listCourses,
  listShelfItems,
  listMoments,
  listNotes,
  listProjects,
  listSessions,
  listJournalEntries,
  listCertificates,
  listCuriosities,
  getLearningFocus,
} from "@/services/learning";
import { listSkills } from "@/services/skills";
import { LearningClient } from "@/components/learning/learning-client";

export const metadata: Metadata = { title: "Learning" };

export default async function LearningPage() {
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;

  const [
    paths,
    courses,
    shelfItems,
    moments,
    notes,
    projects,
    sessions,
    journalEntries,
    certificates,
    curiosities,
    skills,
    focus,
  ] = user
    ? await Promise.all([
        listPathsWithCourses(supabase, user.id),
        listCourses(supabase, user.id),
        listShelfItems(supabase, user.id),
        listMoments(supabase, user.id),
        listNotes(supabase, user.id),
        listProjects(supabase, user.id),
        listSessions(supabase, user.id),
        listJournalEntries(supabase, user.id),
        listCertificates(supabase, user.id),
        listCuriosities(supabase, user.id),
        listSkills(supabase, user.id),
        getLearningFocus(supabase, user.id),
      ])
    : [[], [], [], [], [], [], [], [], [], [], [], ""];

  return (
    <LearningClient
      paths={paths}
      courses={courses}
      shelfItems={shelfItems}
      moments={moments}
      notes={notes}
      projects={projects}
      sessions={sessions}
      journalEntries={journalEntries}
      certificates={certificates}
      curiosities={curiosities}
      skills={skills}
      focus={focus}
    />
  );
}
