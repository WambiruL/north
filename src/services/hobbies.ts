import type { SupabaseClient } from "@supabase/supabase-js";
import { format, subDays } from "date-fns";
import type { Database } from "@/types/database.types";
import type {
  HobbyInput,
  HobbyProjectInput,
  HobbyMemoryInput,
  HobbyNoteInput,
} from "@/lib/validation/hobbies";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;
type HobbyProject = Database["public"]["Tables"]["hobby_projects"]["Row"];
type HobbyMemory = Database["public"]["Tables"]["hobby_memories"]["Row"];

export interface HobbyStats {
  streakDays: number;
  timeSpentMinutes: number;
  completedProjectPct: number;
  latestMemory: HobbyMemory | null;
}

/** Consecutive-day streak of logged moments, ending today or yesterday. */
function computeStreakDays(occurredOnDates: string[]): number {
  const daySet = new Set(occurredOnDates);
  let cursor = new Date();
  if (!daySet.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
  }
  let streak = 0;
  while (daySet.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "No time logged yet";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m logged`;
  if (m === 0) return `${h}h logged`;
  return `${h}h ${m}m logged`;
}

export function computeHobbyStats(memories: HobbyMemory[], projects: HobbyProject[]): HobbyStats {
  const streakDays = computeStreakDays(memories.map((m) => m.occurred_on));
  const timeSpentMinutes = memories.reduce((sum, m) => sum + (m.duration_minutes ?? 0), 0);
  const completed = projects.filter((p) => p.status === "completed").length;
  const completedProjectPct = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0;
  const latestMemory = memories[0] ?? null;
  return { streakDays, timeSpentMinutes, completedProjectPct, latestMemory };
}

export async function listHobbiesWithCounts(supabase: Client, userId: string) {
  const [{ data: hobbies }, { data: projects }, { data: memories }] = await Promise.all([
    supabase.from("hobbies").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("hobby_projects").select("*").eq("user_id", userId),
    supabase
      .from("hobby_memories")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false }),
  ]);

  const projectsByHobby = new Map<string, HobbyProject[]>();
  for (const project of projects ?? []) {
    const list = projectsByHobby.get(project.hobby_id) ?? [];
    list.push(project);
    projectsByHobby.set(project.hobby_id, list);
  }

  const memoriesByHobby = new Map<string, HobbyMemory[]>();
  for (const memory of memories ?? []) {
    const list = memoriesByHobby.get(memory.hobby_id) ?? [];
    list.push(memory);
    memoriesByHobby.set(memory.hobby_id, list);
  }

  return (hobbies ?? []).map((hobby) => {
    const hobbyProjects = projectsByHobby.get(hobby.id) ?? [];
    const hobbyMemories = memoriesByHobby.get(hobby.id) ?? [];
    return {
      ...hobby,
      projectCount: hobbyProjects.length,
      memoryCount: hobbyMemories.length,
      stats: computeHobbyStats(hobbyMemories, hobbyProjects),
    };
  });
}

export async function getHobbyDetail(supabase: Client, userId: string, id: string) {
  const [{ data: hobby }, { data: projects }, { data: memories }, { data: notes }, { data: inspiration }] =
    await Promise.all([
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
      supabase
        .from("hobby_notes")
        .select("*")
        .eq("user_id", userId)
        .eq("hobby_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("inspiration_items")
        .select("*")
        .eq("user_id", userId)
        .eq("hobby_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!hobby) return null;

  return {
    hobby,
    projects: projects ?? [],
    memories: memories ?? [],
    notes: notes ?? [],
    inspiration: inspiration ?? [],
    stats: computeHobbyStats(memories ?? [], projects ?? []),
  };
}

export type HobbyDetail = NonNullable<Awaited<ReturnType<typeof getHobbyDetail>>>;

export async function createHobby(supabase: Client, userId: string, input: HobbyInput) {
  const { data, error } = await supabase
    .from("hobbies")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      cover_url: input.coverUrl || null,
      goal: input.goal || null,
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

export async function updateHobby(supabase: Client, userId: string, id: string, input: HobbyInput) {
  const { data, error } = await supabase
    .from("hobbies")
    .update({
      name: input.name,
      description: input.description || null,
      cover_url: input.coverUrl || null,
      goal: input.goal || null,
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

  await logActivity(supabase, {
    userId,
    module: "hobby",
    verb: "started a project in",
    summary: data.title,
    entityTable: "hobby_projects",
    entityId: data.id,
  });

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
  const { error } = await supabase.from("hobby_projects").delete().eq("id", id).eq("user_id", userId);
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
      duration_minutes: input.durationMinutes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobby",
    verb: "logged a moment in",
    summary: `${hobbyName}: ${input.caption}`,
    entityTable: "hobby_memories",
    entityId: data.id,
  });

  return data;
}

export async function deleteHobbyMemory(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("hobby_memories").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createHobbyNote(
  supabase: Client,
  userId: string,
  hobbyId: string,
  input: HobbyNoteInput,
) {
  const { data, error } = await supabase
    .from("hobby_notes")
    .insert({ user_id: userId, hobby_id: hobbyId, body: input.body })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateHobbyNote(
  supabase: Client,
  userId: string,
  id: string,
  input: HobbyNoteInput,
) {
  const { data, error } = await supabase
    .from("hobby_notes")
    .update({ body: input.body })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHobbyNote(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("hobby_notes").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
