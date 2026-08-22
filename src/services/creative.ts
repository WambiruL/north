import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  CreativeProjectInput,
  CreativeIdeaInput,
  InspirationItemInput,
  MoodboardInput,
  ProjectEntryInput,
} from "@/lib/validation/creative";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

function toTagArray(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function toUrlArray(urls?: string): string[] {
  if (!urls) return [];
  return urls
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);
}

export async function listProjects(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("creative_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listIdeas(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("creative_ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listInspirationItems(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("inspiration_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listMoodboards(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("creative_moodboards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Studio activity timeline — reuses the shared activity log, scoped to the creative module. */
export async function listStudioActivity(supabase: Client, userId: string, limit = 8) {
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .eq("module", "creative")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getProjectDetail(supabase: Client, userId: string, id: string) {
  const [{ data: project }, { data: entries }] = await Promise.all([
    supabase.from("creative_projects").select("*").eq("user_id", userId).eq("id", id).maybeSingle(),
    supabase
      .from("creative_project_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!project) return null;
  return { project, entries: entries ?? [] };
}

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectDetail>>>;

export async function createProject(supabase: Client, userId: string, input: CreativeProjectInput) {
  const { data, error } = await supabase
    .from("creative_projects")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      status: input.status,
      cover_url: input.coverUrl || null,
      tools: input.tools || null,
      link_url: input.linkUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "creative",
    verb: "started",
    summary: data.title,
    entityTable: "creative_projects",
    entityId: data.id,
  });

  return data;
}

export async function updateProject(
  supabase: Client,
  userId: string,
  id: string,
  input: CreativeProjectInput,
) {
  const { data: previous } = await supabase
    .from("creative_projects")
    .select("status")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("creative_projects")
    .update({
      title: input.title,
      description: input.description || null,
      status: input.status,
      cover_url: input.coverUrl || null,
      tools: input.tools || null,
      link_url: input.linkUrl || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (previous && previous.status !== "completed" && input.status === "completed") {
    await logActivity(supabase, {
      userId,
      module: "creative",
      verb: "archived a finished piece:",
      summary: data.title,
      entityTable: "creative_projects",
      entityId: data.id,
    });
  }

  return data;
}

export async function deleteProject(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("creative_projects").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createIdea(supabase: Client, userId: string, input: CreativeIdeaInput) {
  const { data, error } = await supabase
    .from("creative_ideas")
    .insert({
      user_id: userId,
      title: input.title,
      note: input.note || null,
      status: input.status,
      tags: toTagArray(input.tags),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "creative",
    verb: "planted an idea:",
    summary: data.title,
    entityTable: "creative_ideas",
    entityId: data.id,
  });

  return data;
}

export async function updateIdea(
  supabase: Client,
  userId: string,
  id: string,
  input: CreativeIdeaInput,
) {
  const { data, error } = await supabase
    .from("creative_ideas")
    .update({
      title: input.title,
      note: input.note || null,
      status: input.status,
      tags: toTagArray(input.tags),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteIdea(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("creative_ideas").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function promoteIdea(
  supabase: Client,
  userId: string,
  ideaId: string,
  projectTitle: string,
) {
  const { data: idea } = await supabase
    .from("creative_ideas")
    .select("*")
    .eq("id", ideaId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!idea) throw new Error("Idea not found");

  const { data: project, error: projectError } = await supabase
    .from("creative_projects")
    .insert({
      user_id: userId,
      title: projectTitle,
      description: idea.note ?? null,
      status: "active",
    })
    .select()
    .single();

  if (projectError) throw new Error(projectError.message);

  const { error: ideaError } = await supabase
    .from("creative_ideas")
    .update({ status: "promoted", promoted_project_id: project.id })
    .eq("id", ideaId)
    .eq("user_id", userId);

  if (ideaError) throw new Error(ideaError.message);

  await logActivity(supabase, {
    userId,
    module: "creative",
    verb: "promoted an idea into",
    summary: project.title,
    entityTable: "creative_projects",
    entityId: project.id,
  });

  return project;
}

export async function createInspirationItem(
  supabase: Client,
  userId: string,
  input: InspirationItemInput,
) {
  const { data, error } = await supabase
    .from("inspiration_items")
    .insert({
      user_id: userId,
      title: input.title,
      source_url: input.sourceUrl || null,
      image_url: input.imageUrl || null,
      note: input.note || null,
      kind: input.kind || null,
      hobby_id: input.hobbyId || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: input.hobbyId ? "hobby" : "creative",
    verb: "kept a piece of inspiration:",
    summary: data.title,
    entityTable: "inspiration_items",
    entityId: data.id,
  });

  return data;
}

export async function deleteInspirationItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("inspiration_items").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createMoodboard(supabase: Client, userId: string, input: MoodboardInput) {
  const { data, error } = await supabase
    .from("creative_moodboards")
    .insert({
      user_id: userId,
      title: input.title,
      note: input.note || null,
      image_urls: toUrlArray(input.imageUrls),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "creative",
    verb: "started a moodboard:",
    summary: data.title,
    entityTable: "creative_moodboards",
    entityId: data.id,
  });

  return data;
}

export async function updateMoodboard(
  supabase: Client,
  userId: string,
  id: string,
  input: MoodboardInput,
) {
  const { data, error } = await supabase
    .from("creative_moodboards")
    .update({
      title: input.title,
      note: input.note || null,
      image_urls: toUrlArray(input.imageUrls),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMoodboard(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("creative_moodboards").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createProjectEntry(
  supabase: Client,
  userId: string,
  projectId: string,
  projectTitle: string,
  input: ProjectEntryInput,
) {
  const { data, error } = await supabase
    .from("creative_project_entries")
    .insert({
      user_id: userId,
      project_id: projectId,
      title: input.title,
      body: input.body || null,
      image_url: input.imageUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "creative",
    verb: `wrote a page in ${projectTitle}:`,
    summary: data.title,
    entityTable: "creative_project_entries",
    entityId: data.id,
  });

  return data;
}

export async function updateProjectEntry(
  supabase: Client,
  userId: string,
  id: string,
  input: ProjectEntryInput,
) {
  const { data, error } = await supabase
    .from("creative_project_entries")
    .update({
      title: input.title,
      body: input.body || null,
      image_url: input.imageUrl || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProjectEntry(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("creative_project_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
