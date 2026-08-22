import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database.types";
import type {
  LearningPathInput,
  CourseInput,
  ShelfItemInput,
  MomentInput,
  NoteInput,
  ProjectInput,
  SessionInput,
  JournalEntryInput,
  CertificateInput,
  CuriosityInput,
} from "@/lib/validation/learning";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

// ---------- Learning paths (kept for compatibility; not surfaced as its ----------
// own section any more — the mockup replaces it with the skill-grouped map).

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
      note: input.note ?? null,
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
      note: input.note ?? null,
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

// ---------- Shelf (books / videos / podcasts / articles worth returning to) ----------

export async function listShelfItems(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createShelfItem(supabase: Client, userId: string, input: ShelfItemInput) {
  const { data, error } = await supabase
    .from("learning_resources")
    .insert({
      user_id: userId,
      title: input.title,
      author: input.author ?? null,
      kind: input.kind,
      status: input.status,
      url: input.url ?? null,
      note: input.note ?? null,
      progress_current: input.progressCurrent ?? null,
      progress_total: input.progressTotal ?? null,
      is_saved_for_later: input.status === "queued",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "added to the shelf",
    summary: input.title,
    entityTable: "learning_resources",
    entityId: data.id,
  });

  return data;
}

export async function updateShelfItem(
  supabase: Client,
  userId: string,
  id: string,
  input: ShelfItemInput,
) {
  const { data, error } = await supabase
    .from("learning_resources")
    .update({
      title: input.title,
      author: input.author ?? null,
      kind: input.kind,
      status: input.status,
      url: input.url ?? null,
      note: input.note ?? null,
      progress_current: input.progressCurrent ?? null,
      progress_total: input.progressTotal ?? null,
      is_saved_for_later: input.status === "queued",
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteShelfItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("learning_resources")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Moments (this year's timeline) ----------

export async function listMoments(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_moments")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  return data ?? [];
}

export async function createMoment(supabase: Client, userId: string, input: MomentInput) {
  const { data, error } = await supabase
    .from("learning_moments")
    .insert({ user_id: userId, occurred_on: input.occurredOn, what: input.what })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMoment(supabase: Client, userId: string, id: string, input: MomentInput) {
  const { data, error } = await supabase
    .from("learning_moments")
    .update({ occurred_on: input.occurredOn, what: input.what })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMoment(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("learning_moments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Notes ("knots") ----------

export async function listNotes(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createNote(supabase: Client, userId: string, input: NoteInput) {
  const { data, error } = await supabase
    .from("learning_notes")
    .insert({
      user_id: userId,
      title: input.title,
      body: input.body,
      tags: input.tags,
      linked_skill_id: input.linkedSkillId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "wrote a note",
    summary: input.title,
    entityTable: "learning_notes",
    entityId: data.id,
  });

  return data;
}

export async function updateNote(supabase: Client, userId: string, id: string, input: NoteInput) {
  const { data, error } = await supabase
    .from("learning_notes")
    .update({
      title: input.title,
      body: input.body,
      tags: input.tags,
      linked_skill_id: input.linkedSkillId ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNote(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("learning_notes").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Projects ----------

export async function listProjects(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createProject(supabase: Client, userId: string, input: ProjectInput) {
  const { data, error } = await supabase
    .from("learning_projects")
    .insert({
      user_id: userId,
      title: input.title,
      progress: input.progress,
      due_date: input.dueDate ?? null,
      skills_practised: input.skillsPractised ?? null,
      outcome: input.outcome ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "started a learning project",
    summary: input.title,
    entityTable: "learning_projects",
    entityId: data.id,
  });

  return data;
}

export async function updateProject(supabase: Client, userId: string, id: string, input: ProjectInput) {
  const { data, error } = await supabase
    .from("learning_projects")
    .update({
      title: input.title,
      progress: input.progress,
      due_date: input.dueDate ?? null,
      skills_practised: input.skillsPractised ?? null,
      outcome: input.outcome ?? null,
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
    .from("learning_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Practice sessions ----------

export async function listSessions(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  return data ?? [];
}

export async function createSession(supabase: Client, userId: string, input: SessionInput) {
  const { data, error } = await supabase
    .from("learning_sessions")
    .insert({
      user_id: userId,
      skill_id: input.skillId ?? null,
      occurred_on: input.occurredOn,
      minutes: input.minutes,
      note: input.note ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "logged a practice session",
    summary: `${input.minutes} minutes`,
    entityTable: "learning_sessions",
    entityId: data.id,
  });

  return data;
}

export async function updateSession(supabase: Client, userId: string, id: string, input: SessionInput) {
  const { data, error } = await supabase
    .from("learning_sessions")
    .update({
      skill_id: input.skillId ?? null,
      occurred_on: input.occurredOn,
      minutes: input.minutes,
      note: input.note ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSession(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("learning_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Journal ----------

export async function listJournalEntries(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });
  return data ?? [];
}

export async function createJournalEntry(supabase: Client, userId: string, input: JournalEntryInput) {
  const { data, error } = await supabase
    .from("learning_journal_entries")
    .insert({
      user_id: userId,
      entry_date: input.entryDate,
      prompt: input.prompt,
      body: input.body,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateJournalEntry(
  supabase: Client,
  userId: string,
  id: string,
  input: JournalEntryInput,
) {
  const { data, error } = await supabase
    .from("learning_journal_entries")
    .update({ entry_date: input.entryDate, prompt: input.prompt, body: input.body })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteJournalEntry(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("learning_journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Certificates ----------

export async function listCertificates(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_on", { ascending: false });
  return data ?? [];
}

export async function createCertificate(supabase: Client, userId: string, input: CertificateInput) {
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      title: input.title,
      issuing_org: input.issuingOrg ?? null,
      issued_on: input.issuedOn,
      note: input.note ?? null,
      course_id: input.courseId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "learning",
    verb: "earned a certificate",
    summary: input.title,
    entityTable: "certificates",
    entityId: data.id,
  });

  return data;
}

export async function updateCertificate(
  supabase: Client,
  userId: string,
  id: string,
  input: CertificateInput,
) {
  const { data, error } = await supabase
    .from("certificates")
    .update({
      title: input.title,
      issuing_org: input.issuingOrg ?? null,
      issued_on: input.issuedOn,
      note: input.note ?? null,
      course_id: input.courseId ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCertificate(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("certificates").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Curiosities ----------

export async function listCuriosities(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_curiosities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createCuriosity(supabase: Client, userId: string, input: CuriosityInput) {
  const { data, error } = await supabase
    .from("learning_curiosities")
    .insert({
      user_id: userId,
      topic: input.topic,
      why: input.why ?? null,
      status: input.status,
      resources_gathered: input.resourcesGathered ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCuriosity(
  supabase: Client,
  userId: string,
  id: string,
  input: CuriosityInput,
) {
  const { data, error } = await supabase
    .from("learning_curiosities")
    .update({
      topic: input.topic,
      why: input.why ?? null,
      status: input.status,
      resources_gathered: input.resourcesGathered ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCuriosity(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("learning_curiosities")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Profile (this season's focus) ----------

export async function getLearningFocus(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("learning_profile")
    .select("focus")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.focus ?? "";
}

export async function saveLearningFocus(supabase: Client, userId: string, focus: string) {
  const { error } = await supabase
    .from("learning_profile")
    .upsert({ user_id: userId, focus: focus || null }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

// ---------- Computed overview stats ----------

export function computeLearningOverview(
  courses: Tables<"courses">[],
  sessions: Tables<"learning_sessions">[],
  shelfItems: Tables<"learning_resources">[],
  skills: Tables<"skills">[],
) {
  const inProgress = courses.filter((c) => c.status === "in_progress").length;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((s) => new Date(s.occurred_on).getTime() >= thirtyDaysAgo);
  const recentMinutes = recentSessions.reduce((sum, s) => sum + s.minutes, 0);
  const hours = Math.floor(recentMinutes / 60);
  const mins = recentMinutes % 60;
  const practiceLabel = recentMinutes ? `${hours}h ${mins}m` : "0h";

  const onShelf = shelfItems.filter((r) => r.status !== "completed").length;

  return [
    {
      label: "Courses in progress",
      value: inProgress ? String(inProgress) : "None",
      sub: inProgress ? "Keep going" : "Nothing active",
    },
    {
      label: "Practice, last 30 days",
      value: practiceLabel,
      sub: recentSessions.length ? `${recentSessions.length} sessions logged` : "No sessions yet",
    },
    {
      label: "On the shelf",
      value: onShelf ? String(onShelf) : "Empty",
      sub: onShelf ? "Waiting for you" : "Add something to read",
    },
    {
      label: "Skills tracked",
      value: skills.length ? String(skills.length) : "None",
      sub: skills.length ? "With evidence, not just claims" : "Start with one",
    },
  ];
}
