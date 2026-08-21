import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ClientInput, ProjectInput, TaskInput } from "@/lib/validation/work";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

// ---------- Clients ----------

export async function listClients(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  return data ?? [];
}

export async function createWorkClient(supabase: Client, userId: string, input: ClientInput) {
  const { data, error } = await supabase
    .from("clients")
    .insert({ user_id: userId, name: input.name, notes: input.notes ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateWorkClient(
  supabase: Client,
  userId: string,
  id: string,
  input: ClientInput,
) {
  const { data, error } = await supabase
    .from("clients")
    .update({ name: input.name, notes: input.notes ?? null })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteWorkClient(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("clients").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Projects ----------

export async function listProjectsWithTaskCounts(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("work_projects")
    .select("*, client:clients(id, name), work_tasks(id, is_done)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((project) => {
    const tasks = project.work_tasks ?? [];
    const done = tasks.filter((t) => t.is_done).length;
    return {
      ...project,
      taskCounts: { done, total: tasks.length },
    };
  });
}

export async function getProjectDetail(supabase: Client, userId: string, id: string) {
  const { data: project, error } = await supabase
    .from("work_projects")
    .select("*, client:clients(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!project) return null;

  const [{ data: tasks }, { data: transactions }] = await Promise.all([
    supabase
      .from("work_tasks")
      .select("*")
      .eq("work_project_id", id)
      .eq("user_id", userId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("*")
      .eq("work_project_id", id)
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false }),
  ]);

  return {
    project,
    tasks: tasks ?? [],
    transactions: transactions ?? [],
  };
}

export async function createProject(supabase: Client, userId: string, input: ProjectInput) {
  const { data, error } = await supabase
    .from("work_projects")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      client_id: input.clientId ?? null,
      status: input.status,
      start_date: input.startDate,
      due_date: input.dueDate ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "work",
    verb: "started",
    summary: input.name,
    entityTable: "work_projects",
    entityId: data.id,
  });

  return data;
}

export async function updateProject(
  supabase: Client,
  userId: string,
  id: string,
  input: ProjectInput,
) {
  const { data, error } = await supabase
    .from("work_projects")
    .update({
      name: input.name,
      description: input.description ?? null,
      client_id: input.clientId ?? null,
      status: input.status,
      start_date: input.startDate,
      due_date: input.dueDate ?? null,
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
    .from("work_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Tasks ----------

export async function createTask(
  supabase: Client,
  userId: string,
  workProjectId: string,
  input: TaskInput,
) {
  const { data, error } = await supabase
    .from("work_tasks")
    .insert({
      user_id: userId,
      work_project_id: workProjectId,
      title: input.title,
      due_date: input.dueDate ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTask(supabase: Client, userId: string, id: string, input: TaskInput) {
  const { data, error } = await supabase
    .from("work_tasks")
    .update({ title: input.title, due_date: input.dueDate ?? null })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTask(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("work_tasks").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function toggleTaskDone(supabase: Client, userId: string, id: string) {
  const { data: current, error: fetchError } = await supabase
    .from("work_tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const nextDone = !current.is_done;

  const { data, error } = await supabase
    .from("work_tasks")
    .update({
      is_done: nextDone,
      completed_at: nextDone ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (nextDone) {
    await logActivity(supabase, {
      userId,
      module: "work",
      verb: "completed",
      summary: current.title,
      entityTable: "work_tasks",
      entityId: id,
    });
  }

  return data;
}
