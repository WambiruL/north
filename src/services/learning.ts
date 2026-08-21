import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database.types";
import type { LearningPathInput, CourseInput, ResourceInput } from "@/lib/validation/learning";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

// ---------- Learning paths ----------

export type PathWithCourses = Tables<"learning_paths"> & { courses: Tables<"courses">[] };

interface PathRow extends Tables<"learning_paths"> {
  courses: Tables<"courses">[] | null;
}

export async function listLearningPaths(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listPathsWithCourses(
  supabase: Client,
  userId: string,
): Promise<PathWithCourses[]> {
  const { data } = await supabase
    .from("learning_paths")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return ((data as unknown as PathRow[]) ?? []).map((path) => {
    const { courses, ...rest } = path;
    return { ...rest, courses: courses ?? [] };
  });
}

export async function createLearningPath(supabase: Client, userId: string, input: LearningPathInput) {
  const { data, error } = await supabase
    .from("learning_paths")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      skill_id: input.skillId ?? null,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "started a learning path",
    summary: input.title,
    entityTable: "learning_paths",
    entityId: data.id,
  });

  return data;
}

export async function updateLearningPath(
  supabase: Client,
  userId: string,
  id: string,
  input: LearningPathInput,
) {
  const { data, error } = await supabase
    .from("learning_paths")
    .update({
      title: input.title,
      description: input.description ?? null,
      skill_id: input.skillId ?? null,
      status: input.status,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLearningPath(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("learning_paths").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Courses ----------

export async function listCourses(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createCourse(supabase: Client, userId: string, input: CourseInput) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      user_id: userId,
      learning_path_id: input.learningPathId ?? null,
      title: input.title,
      provider: input.provider ?? null,
      status: input.status,
      progress: input.progress,
      url: input.url ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "added a course",
    summary: input.title,
    entityTable: "courses",
    entityId: data.id,
  });

  return data;
}

export async function updateCourse(supabase: Client, userId: string, id: string, input: CourseInput) {
  const { data, error } = await supabase
    .from("courses")
    .update({
      learning_path_id: input.learningPathId ?? null,
      title: input.title,
      provider: input.provider ?? null,
      status: input.status,
      progress: input.progress,
      url: input.url ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCourse(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Resources ----------

export async function listResources(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createResource(supabase: Client, userId: string, input: ResourceInput) {
  const { data, error } = await supabase
    .from("learning_resources")
    .insert({
      user_id: userId,
      title: input.title,
      kind: input.kind,
      url: input.url ?? null,
      note: input.note ?? null,
      is_saved_for_later: input.isSavedForLater,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "saved a resource",
    summary: input.title,
    entityTable: "learning_resources",
    entityId: data.id,
  });

  return data;
}

export async function updateResource(supabase: Client, userId: string, id: string, input: ResourceInput) {
  const { data, error } = await supabase
    .from("learning_resources")
    .update({
      title: input.title,
      kind: input.kind,
      url: input.url ?? null,
      note: input.note ?? null,
      is_saved_for_later: input.isSavedForLater,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteResource(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("learning_resources")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
