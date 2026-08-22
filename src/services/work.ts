import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  ClientInput,
  ProjectInput,
  TaskInput,
  FocusTaskInput,
  OpportunityInput,
  InvoiceInput,
  WinInput,
  WorkNoteInput,
  ContactInput,
} from "@/lib/validation/work";
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

// ---------- Focus tasks (Today tab: priorities + deadlines) ----------
// Both are work_tasks rows scoped to a project. Priorities are flagged
// is_priority; deadlines are any incomplete task with a due date.

export async function listFocusTasks(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("work_tasks")
    .select("*, work_project:work_projects(id, name)")
    .eq("user_id", userId)
    .eq("is_done", false)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createFocusTask(supabase: Client, userId: string, input: FocusTaskInput) {
  const { data, error } = await supabase
    .from("work_tasks")
    .insert({
      user_id: userId,
      work_project_id: input.workProjectId,
      title: input.title,
      due_date: input.dueDate ?? null,
      is_priority: input.isPriority,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateFocusTask(
  supabase: Client,
  userId: string,
  id: string,
  input: FocusTaskInput,
) {
  const { data, error } = await supabase
    .from("work_tasks")
    .update({
      work_project_id: input.workProjectId,
      title: input.title,
      due_date: input.dueDate ?? null,
      is_priority: input.isPriority,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------- Opportunities (freelance leads, collabs, and job applications) ----------

export async function listOpportunities(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("work_opportunities")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOpportunity(supabase: Client, userId: string, input: OpportunityInput) {
  const { data, error } = await supabase
    .from("work_opportunities")
    .insert({
      user_id: userId,
      kind: input.kind,
      title: input.title,
      organization: input.organization ?? null,
      status: input.status,
      due_date: input.dueDate ?? null,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "work",
    verb: input.kind === "job" ? "applied to" : "logged an opportunity with",
    summary: input.organization ? `${input.title} · ${input.organization}` : input.title,
    entityTable: "work_opportunities",
    entityId: data.id,
  });

  return data;
}

export async function updateOpportunity(
  supabase: Client,
  userId: string,
  id: string,
  input: OpportunityInput,
) {
  const { data, error } = await supabase
    .from("work_opportunities")
    .update({
      kind: input.kind,
      title: input.title,
      organization: input.organization ?? null,
      status: input.status,
      due_date: input.dueDate ?? null,
      note: input.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOpportunity(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("work_opportunities")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Invoices ----------

export async function listInvoices(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, client:clients(id, name), work_project:work_projects(id, name)")
    .eq("user_id", userId)
    .order("issued_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createInvoice(supabase: Client, userId: string, input: InvoiceInput) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      client_id: input.clientId ?? null,
      work_project_id: input.workProjectId ?? null,
      title: input.title,
      amount: input.amount,
      status: input.status,
      issued_on: input.issuedOn,
      due_on: input.dueOn ?? null,
      paid_on: input.status === "paid" ? (input.paidOn ?? input.issuedOn) : (input.paidOn ?? null),
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "work",
    verb: "invoiced",
    summary: `${input.title} (${input.amount})`,
    entityTable: "invoices",
    entityId: data.id,
  });

  return data;
}

export async function updateInvoice(
  supabase: Client,
  userId: string,
  id: string,
  input: InvoiceInput,
) {
  const { data, error } = await supabase
    .from("invoices")
    .update({
      client_id: input.clientId ?? null,
      work_project_id: input.workProjectId ?? null,
      title: input.title,
      amount: input.amount,
      status: input.status,
      issued_on: input.issuedOn,
      due_on: input.dueOn ?? null,
      paid_on: input.status === "paid" ? (input.paidOn ?? input.issuedOn) : (input.paidOn ?? null),
      notes: input.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInvoice(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Wins ----------

export async function listWins(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("work_wins")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createWin(supabase: Client, userId: string, input: WinInput) {
  const { data, error } = await supabase
    .from("work_wins")
    .insert({
      user_id: userId,
      title: input.title,
      kind: input.kind ?? null,
      note: input.note ?? null,
      occurred_on: input.occurredOn,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "work",
    verb: "logged a win",
    summary: input.title,
    entityTable: "work_wins",
    entityId: data.id,
  });

  return data;
}

export async function updateWin(supabase: Client, userId: string, id: string, input: WinInput) {
  const { data, error } = await supabase
    .from("work_wins")
    .update({
      title: input.title,
      kind: input.kind ?? null,
      note: input.note ?? null,
      occurred_on: input.occurredOn,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteWin(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("work_wins").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Notes ----------

export async function listWorkNotes(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("work_notes")
    .select("*, work_project:work_projects(id, name)")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createWorkNote(supabase: Client, userId: string, input: WorkNoteInput) {
  const { data, error } = await supabase
    .from("work_notes")
    .insert({
      user_id: userId,
      work_project_id: input.workProjectId ?? null,
      title: input.title,
      body: input.body,
      met_with: input.metWith ?? null,
      occurred_on: input.occurredOn,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateWorkNote(
  supabase: Client,
  userId: string,
  id: string,
  input: WorkNoteInput,
) {
  const { data, error } = await supabase
    .from("work_notes")
    .update({
      work_project_id: input.workProjectId ?? null,
      title: input.title,
      body: input.body,
      met_with: input.metWith ?? null,
      occurred_on: input.occurredOn,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteWorkNote(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("work_notes").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Network contacts ----------

export async function listContacts(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("work_contacts")
    .select("*")
    .eq("user_id", userId)
    .order("last_contact_on", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createContact(supabase: Client, userId: string, input: ContactInput) {
  const { data, error } = await supabase
    .from("work_contacts")
    .insert({
      user_id: userId,
      name: input.name,
      role: input.role ?? null,
      organization: input.organization ?? null,
      how_met: input.howMet ?? null,
      note: input.note ?? null,
      last_contact_on: input.lastContactOn ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateContact(
  supabase: Client,
  userId: string,
  id: string,
  input: ContactInput,
) {
  const { data, error } = await supabase
    .from("work_contacts")
    .update({
      name: input.name,
      role: input.role ?? null,
      organization: input.organization ?? null,
      how_met: input.howMet ?? null,
      note: input.note ?? null,
      last_contact_on: input.lastContactOn ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContact(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("work_contacts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Analytics (computed from real rows, no invented numbers) ----------

export async function getWorkAnalytics(supabase: Client, userId: string) {
  const [{ data: projects }, { data: invoices }, { data: wins }, { data: opportunities }] =
    await Promise.all([
      supabase.from("work_projects").select("status, created_at").eq("user_id", userId),
      supabase.from("invoices").select("amount, status, issued_on").eq("user_id", userId),
      supabase.from("work_wins").select("id, occurred_on").eq("user_id", userId),
      supabase.from("work_opportunities").select("kind, status").eq("user_id", userId),
    ]);

  const allProjects = projects ?? [];
  const activeProjects = allProjects.filter((p) => p.status === "active").length;

  const allInvoices = invoices ?? [];
  const outstanding = allInvoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const paidTotal = allInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const now = new Date();
  const quarterAgo = new Date(now);
  quarterAgo.setMonth(quarterAgo.getMonth() - 3);
  const winsThisQuarter = (wins ?? []).filter(
    (w) => new Date(w.occurred_on) >= quarterAgo,
  ).length;

  const jobApps = (opportunities ?? []).filter((o) => o.kind === "job");
  const interviewing = jobApps.filter((o) => o.status === "interview").length;

  return {
    activeProjects,
    totalProjects: allProjects.length,
    outstanding,
    paidTotal,
    winsThisQuarter,
    totalWins: (wins ?? []).length,
    jobApplications: jobApps.length,
    interviewing,
    openOpportunities: (opportunities ?? []).filter(
      (o) => o.kind !== "job" && !["won", "lost", "rejected"].includes(o.status),
    ).length,
  };
}
