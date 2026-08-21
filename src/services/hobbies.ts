import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  HobbyInput,
  HobbyProjectInput,
  HobbyMemoryInput,
} from "@/lib/validation/hobbies";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listHobbiesWithCounts(supabase: Client, userId: string) {
  const [{ data: hobbies }, { data: projects }] = await Promise.all([
    supabase
      .from("hobbies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("hobby_projects").select("hobby_id").eq("user_id", userId),
  ]);

  const counts = new Map<string, number>();
  for (const project of projects ?? []) {
    counts.set(project.hobby_id, (counts.get(project.hobby_id) ?? 0) + 1);
  }

  return (hobbies ?? []).map((hobby) => ({
    ...hobby,
    projectCount: counts.get(hobby.id) ?? 0,
  }));
}

export async function getHobbyDetail(supabase: Client, userId: string, id: string) {
  const [{ data: hobby }, { data: projects }, { data: memories }] = await Promise.all([
    supabase.from("hobbies").select("*").eq("user_id", userId).eq("id", id).maybeSingle(),
    supabase
      .from("hobby_projects")
      .select("*")
      .eq("user_id", userId)
      .eq("hobby_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("hobby_memories")
      .select("*")
      .eq("user_id", userId)
      .eq("hobby_id", id)
      .order("occurred_on", { ascending: false }),
  ]);

  if (!hobby) return null;

  return { hobby, projects: projects ?? [], memories: memories ?? [] };
}

export async function createHobby(supabase: Client, userId: string, input: HobbyInput) {
  const { data, error } = await supabase
    .from("hobbies")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      cover_url: input.coverUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobby",
    verb: "picked up",
    summary: data.name,
    entityTable: "hobbies",
    entityId: data.id,
  });

  return data;
}

export async function updateHobby(
  supabase: Client,
  userId: string,
  id: string,
  input: HobbyInput,
) {
  const { data, error } = await supabase
    .from("hobbies")
    .update({
      name: input.name,
      description: input.description || null,
      cover_url: input.coverUrl || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHobby(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("hobbies").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createHobbyProject(
  supabase: Client,
  userId: string,
  hobbyId: string,
  input: HobbyProjectInput,
) {
  const { data, error } = await supabase
    .from("hobby_projects")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      title: input.title,
      status: input.status,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateHobbyProject(
  supabase: Client,
  userId: string,
  id: string,
  input: HobbyProjectInput,
) {
  const { data, error } = await supabase
    .from("hobby_projects")
    .update({
      title: input.title,
      status: input.status,
      notes: input.notes || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHobbyProject(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("hobby_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createHobbyMemory(
  supabase: Client,
  userId: string,
  hobbyId: string,
  hobbyName: string,
  input: HobbyMemoryInput,
) {
  const { data, error } = await supabase
    .from("hobby_memories")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      caption: input.caption,
      image_url: input.imageUrl || null,
      occurred_on: input.occurredOn,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobby",
    verb: "added a memory to",
    summary: `${hobbyName}: ${input.caption}`,
    entityTable: "hobby_memories",
    entityId: data.id,
  });

  return data;
}

export async function deleteHobbyMemory(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("hobby_memories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
