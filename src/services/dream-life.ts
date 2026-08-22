import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  LifeAreaInput,
  DreamInput,
  VisionItemInput,
  FutureHorizonInput,
  BucketListItemInput,
  ManifestoPrincipleInput,
  FutureLetterInput,
} from "@/lib/validation/dream-life";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;
type DreamGoalRow = Database["public"]["Tables"]["dream_goals"]["Row"];

function cleanList(values: string[] | undefined) {
  return (values ?? []).map((v) => v.trim()).filter((v) => v.length > 0);
}

// ---------- life areas ----------

export async function listLifeAreas(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("life_areas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function createLifeArea(supabase: Client, userId: string, input: LifeAreaInput) {
  const { data, error } = await supabase
    .from("life_areas")
    .insert({
      user_id: userId,
      name: input.name,
      question: input.question || null,
      belief: input.belief || null,
      practices: cleanList(input.practices),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateLifeArea(
  supabase: Client,
  userId: string,
  id: string,
  input: LifeAreaInput,
) {
  const { data, error } = await supabase
    .from("life_areas")
    .update({
      name: input.name,
      question: input.question || null,
      belief: input.belief || null,
      practices: cleanList(input.practices),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLifeArea(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("life_areas").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- dreams ----------

export async function listDreams(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("dreams")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listDreamsWithGoals(supabase: Client, userId: string) {
  const [dreams, goals] = await Promise.all([
    listDreams(supabase, userId),
    supabase
      .from("dream_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  const goalsByDream = new Map<string, DreamGoalRow[]>();
  for (const goal of goals.data ?? []) {
    const list = goalsByDream.get(goal.dream_id) ?? [];
    list.push(goal);
    goalsByDream.set(goal.dream_id, list);
  }

  return dreams.map((dream) => {
    const dreamGoals = goalsByDream.get(dream.id) ?? [];
    const milestones = dreamGoals.filter((g) => g.kind === "milestone");
    const actions = dreamGoals.filter((g) => g.kind === "action");
    const doneCount = milestones.filter((g) => g.is_done).length;
    return {
      ...dream,
      milestones,
      actions,
      // Kept for other modules (e.g. the dashboard) that read the flat goal list.
      goals: dreamGoals,
      goalsDone: doneCount,
      goalsTotal: milestones.length,
      progress: milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0,
    };
  });
}

export type DreamWithGoals = Awaited<ReturnType<typeof listDreamsWithGoals>>[number];

async function syncDreamGoals(
  supabase: Client,
  userId: string,
  dreamId: string,
  input: DreamInput,
) {
  const { data: existing } = await supabase
    .from("dream_goals")
    .select("id, kind")
    .eq("dream_id", dreamId)
    .eq("user_id", userId);

  const existingIds = new Set((existing ?? []).map((r) => r.id));
  const keepIds = new Set<string>();

  const milestoneRows = input.milestones ?? [];
  const actionRows = input.actions ?? [];

  for (const m of milestoneRows) {
    if (m.id && existingIds.has(m.id)) {
      keepIds.add(m.id);
      await supabase
        .from("dream_goals")
        .update({ title: m.title, is_done: m.isDone ?? false, kind: "milestone" })
        .eq("id", m.id)
        .eq("user_id", userId);
    } else {
      const { data } = await supabase
        .from("dream_goals")
        .insert({
          user_id: userId,
          dream_id: dreamId,
          title: m.title,
          is_done: m.isDone ?? false,
          kind: "milestone",
        })
        .select("id")
        .single();
      if (data) keepIds.add(data.id);
    }
  }

  for (const a of actionRows) {
    if (a.id && existingIds.has(a.id)) {
      keepIds.add(a.id);
      await supabase
        .from("dream_goals")
        .update({ title: a.title, kind: "action" })
        .eq("id", a.id)
        .eq("user_id", userId);
    } else {
      const { data } = await supabase
        .from("dream_goals")
        .insert({
          user_id: userId,
          dream_id: dreamId,
          title: a.title,
          kind: "action",
        })
        .select("id")
        .single();
      if (data) keepIds.add(data.id);
    }
  }

  const toDelete = [...existingIds].filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from("dream_goals").delete().in("id", toDelete).eq("user_id", userId);
  }
}

export async function createDream(supabase: Client, userId: string, input: DreamInput) {
  const { data, error } = await supabase
    .from("dreams")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.vision || null,
      goal_statement: input.goalStatement || null,
      horizon: input.horizon,
      life_area_id: input.lifeAreaId || null,
      image_url: input.imageUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await syncDreamGoals(supabase, userId, data.id, input);

  await logActivity(supabase, {
    userId,
    module: "dream_life",
    verb: "dreamed up",
    summary: data.title,
    entityTable: "dreams",
    entityId: data.id,
  });

  return data;
}

export async function updateDream(
  supabase: Client,
  userId: string,
  id: string,
  input: DreamInput,
) {
  const { data, error } = await supabase
    .from("dreams")
    .update({
      title: input.title,
      description: input.vision || null,
      goal_statement: input.goalStatement || null,
      horizon: input.horizon,
      life_area_id: input.lifeAreaId || null,
      image_url: input.imageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await syncDreamGoals(supabase, userId, id, input);

  return data;
}

export async function deleteDream(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("dreams").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- vision items ----------

export async function listVisionItems(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("vision_items")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createVisionItem(supabase: Client, userId: string, input: VisionItemInput) {
  const { data: existing } = await supabase
    .from("vision_items")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("vision_items")
    .insert({
      user_id: userId,
      caption: input.caption,
      image_url: input.imageUrl || null,
      dream_id: input.dreamId || null,
      life_area_id: input.lifeAreaId || null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "dream_life",
    verb: "added to the vision board",
    summary: data.caption,
    entityTable: "vision_items",
    entityId: data.id,
  });

  return data;
}

export async function updateVisionItem(
  supabase: Client,
  userId: string,
  id: string,
  input: VisionItemInput,
) {
  const { data, error } = await supabase
    .from("vision_items")
    .update({
      caption: input.caption,
      image_url: input.imageUrl || null,
      dream_id: input.dreamId || null,
      life_area_id: input.lifeAreaId || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteVisionItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("vision_items").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- future timeline (horizons) ----------

export async function listFutureHorizons(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("future_horizons")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createFutureHorizon(
  supabase: Client,
  userId: string,
  input: FutureHorizonInput,
) {
  const { data: existing } = await supabase
    .from("future_horizons")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("future_horizons")
    .insert({
      user_id: userId,
      when_label: input.whenLabel,
      where_text: input.whereText,
      achieved: input.achieved || null,
      learned: input.learned || null,
      feels: input.feels || null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateFutureHorizon(
  supabase: Client,
  userId: string,
  id: string,
  input: FutureHorizonInput,
) {
  const { data, error } = await supabase
    .from("future_horizons")
    .update({
      when_label: input.whenLabel,
      where_text: input.whereText,
      achieved: input.achieved || null,
      learned: input.learned || null,
      feels: input.feels || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFutureHorizon(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("future_horizons")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- bucket list ----------

export async function listBucketListItems(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("bucket_list_items")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createBucketListItem(
  supabase: Client,
  userId: string,
  input: BucketListItemInput,
) {
  const { data: existing } = await supabase
    .from("bucket_list_items")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("bucket_list_items")
    .insert({
      user_id: userId,
      title: input.title,
      category: input.category || null,
      why: input.why || null,
      status: input.status,
      image_url: input.imageUrl || null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "dream_life",
    verb: "added to the bucket list",
    summary: data.title,
    entityTable: "bucket_list_items",
    entityId: data.id,
  });

  return data;
}

export async function updateBucketListItem(
  supabase: Client,
  userId: string,
  id: string,
  input: BucketListItemInput,
) {
  const { data, error } = await supabase
    .from("bucket_list_items")
    .update({
      title: input.title,
      category: input.category || null,
      why: input.why || null,
      status: input.status,
      image_url: input.imageUrl || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBucketListItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("bucket_list_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- manifesto ----------

export async function listManifestoPrinciples(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("manifesto_principles")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createManifestoPrinciple(
  supabase: Client,
  userId: string,
  input: ManifestoPrincipleInput,
) {
  const { data: existing } = await supabase
    .from("manifesto_principles")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("manifesto_principles")
    .insert({
      user_id: userId,
      kind: input.kind,
      text: input.text,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateManifestoPrinciple(
  supabase: Client,
  userId: string,
  id: string,
  input: ManifestoPrincipleInput,
) {
  const { data, error } = await supabase
    .from("manifesto_principles")
    .update({ kind: input.kind, text: input.text })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteManifestoPrinciple(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("manifesto_principles")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- future letters (journal) ----------

export async function listFutureLetters(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("future_letters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createFutureLetter(
  supabase: Client,
  userId: string,
  input: FutureLetterInput,
) {
  const { data, error } = await supabase
    .from("future_letters")
    .insert({
      user_id: userId,
      prompt: input.prompt,
      body: input.body,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "dream_life",
    verb: "wrote to their future self",
    summary: input.prompt,
    entityTable: "future_letters",
    entityId: data.id,
  });

  return data;
}

export async function updateFutureLetter(
  supabase: Client,
  userId: string,
  id: string,
  input: FutureLetterInput,
) {
  const { data, error } = await supabase
    .from("future_letters")
    .update({ prompt: input.prompt, body: input.body })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFutureLetter(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("future_letters")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
