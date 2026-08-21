import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  CreativeProjectInput,
  CreativeIdeaInput,
  InspirationItemInput,
} from "@/lib/validation/creative";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

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

export async function getProjectDetail(supabase: Client, userId: string, id: string) {
  const { data } = await supabase
    .from("creative_projects")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function createProject(
  supabase: Client,
  userId: string,
  input: CreativeProjectInput,
) {
  const { data, error } = await supabase
    .from("creative_projects")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      status: input.status,
      cover_url: input.coverUrl || null,
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
  const { data, error } = await supabase
    .from("creative_projects")
    .update({
      title: input.title,
      description: input.description || null,
      status: input.status,
      cover_url: input.coverUrl || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("creative_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
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
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteIdea(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("creative_ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInspirationItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("inspiration_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
