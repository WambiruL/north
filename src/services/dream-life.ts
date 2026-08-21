import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  LifeAreaInput,
  DreamInput,
  DreamGoalInput,
  VisionItemInput,
} from "@/lib/validation/dream-life";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

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
      belief: input.belief || null,
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
      belief: input.belief || null,
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
      .order("target_date", { ascending: true, nullsFirst: false }),
  ]);

  const goalsByDream = new Map<string, Database["public"]["Tables"]["dream_goals"]["Row"][]>();
  for (const goal of goals.data ?? []) {
    const list = goalsByDream.get(goal.dream_id) ?? [];
    list.push(goal);
    goalsByDream.set(goal.dream_id, list);
  }

  return dreams.map((dream) => {
    const dreamGoals = goalsByDream.get(dream.id) ?? [];
    const doneCount = dreamGoals.filter((g) => g.is_done).length;
    return {
      ...dream,
      goals: dreamGoals,
      goalsDone: doneCount,
      goalsTotal: dreamGoals.length,
      progress: dreamGoals.length > 0 ? Math.round((doneCount / dreamGoals.length) * 100) : 0,
    };
  });
}

export async function createDream(supabase: Client, userId: string, input: DreamInput) {
  const { data, error } = await supabase
    .from("dreams")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      horizon: input.horizon,
      life_area_id: input.lifeAreaId || null,
      image_url: input.imageUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

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
      description: input.description || null,
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
  return data;
}

export async function deleteDream(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("dreams").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- dream goals ----------

export async function createDreamGoal(supabase: Client, userId: string, input: DreamGoalInput) {
  const { data, error } = await supabase
    .from("dream_goals")
    .insert({
      user_id: userId,
      dream_id: input.dreamId,
      title: input.title,
      target_date: input.targetDate || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateDreamGoal(
  supabase: Client,
  userId: string,
  id: string,
  input: Partial<DreamGoalInput>,
) {
  const patch: Database["public"]["Tables"]["dream_goals"]["Update"] = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.targetDate !== undefined) patch.target_date = input.targetDate || null;
  if (input.dreamId !== undefined) patch.dream_id = input.dreamId;

  const { data, error } = await supabase
    .from("dream_goals")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function setDreamGoalDone(
  supabase: Client,
  userId: string,
  id: string,
  isDone: boolean,
) {
  const { data, error } = await supabase
    .from("dream_goals")
    .update({ is_done: isDone })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (isDone) {
    await logActivity(supabase, {
      userId,
      module: "dream_life",
      verb: "achieved",
      summary: data.title,
      entityTable: "dream_goals",
      entityId: data.id,
    });
  }

  return data;
}

export async function deleteDreamGoal(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("dream_goals").delete().eq("id", id).eq("user_id", userId);
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
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
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
