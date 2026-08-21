"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

interface SearchSpec {
  table:
    | "notes"
    | "collections"
    | "career_experiences"
    | "career_goals"
    | "courses"
    | "learning_paths"
    | "work_projects"
    | "hobbies"
    | "hobby_projects"
    | "creative_projects"
    | "creative_ideas"
    | "dreams";
  column: string;
  subtitle: string;
  hrefBase: string;
}

const SPECS: SearchSpec[] = [
  { table: "notes", column: "title", subtitle: "Notes", hrefBase: "/notes" },
  { table: "collections", column: "name", subtitle: "Collections", hrefBase: "/collections" },
  { table: "career_experiences", column: "title", subtitle: "Career · Experience", hrefBase: "/career" },
  { table: "career_goals", column: "title", subtitle: "Career · Goal", hrefBase: "/career" },
  { table: "courses", column: "title", subtitle: "Learning · Course", hrefBase: "/learning" },
  { table: "learning_paths", column: "title", subtitle: "Learning · Path", hrefBase: "/learning" },
  { table: "work_projects", column: "name", subtitle: "Work · Project", hrefBase: "/work" },
  { table: "hobbies", column: "name", subtitle: "Hobbies", hrefBase: "/hobbies" },
  { table: "hobby_projects", column: "title", subtitle: "Hobbies · Project", hrefBase: "/hobbies" },
  { table: "creative_projects", column: "title", subtitle: "Creative Studio · Project", hrefBase: "/creative-studio" },
  { table: "creative_ideas", column: "title", subtitle: "Creative Studio · Idea", hrefBase: "/creative-studio" },
  { table: "dreams", column: "title", subtitle: "Dream Life", hrefBase: "/dream-life" },
];

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = await createClient();

  const results = await Promise.all(
    SPECS.map(async (spec) => {
      const { data } = await supabase
        .from(spec.table)
        .select("id," + spec.column)
        .ilike(spec.column, `%${trimmed}%`)
        .limit(4);

      return (data ?? []).map((row) => {
        const record = row as unknown as Record<string, string>;
        return {
          id: `${spec.table}-${record.id}`,
          title: record[spec.column],
          subtitle: spec.subtitle,
          href: `${spec.hrefBase}/${record.id}`,
        };
      });
    }),
  );

  return results.flat().slice(0, 20);
}
