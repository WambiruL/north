import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listPathsWithCourses, listCourses, listResources } from "@/services/learning";
import { listSkills } from "@/services/skills";
import { LearningClient } from "@/components/learning/learning-client";

export const metadata: Metadata = { title: "Learning" };

export default async function LearningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [paths, courses, resources, skills] = user
    ? await Promise.all([
        listPathsWithCourses(supabase, user.id),
        listCourses(supabase, user.id),
        listResources(supabase, user.id),
        listSkills(supabase, user.id),
      ])
    : [[], [], [], []];

  return <LearningClient paths={paths} courses={courses} resources={resources} skills={skills} />;
}
