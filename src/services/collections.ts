import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CollectionInput, CollectionItemInput } from "@/lib/validation/collections";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listCollections(supabase: Client, userId: string) {
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!collections || collections.length === 0) return [];

  const { data: items } = await supabase
    .from("collection_items")
    .select("id, collection_id, is_done")
    .eq("user_id", userId)
    .in(
      "collection_id",
      collections.map((c) => c.id),
    );

  return collections.map((collection) => {
    const collectionItems = (items ?? []).filter((i) => i.collection_id === collection.id);
    return {
      ...collection,
      itemCount: collectionItems.length,
      doneCount: collectionItems.filter((i) => i.is_done).length,
    };
  });
}

export async function getCollection(supabase: Client, userId: string, id: string) {
  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!collection) return null;

  const { data: items } = await supabase
    .from("collection_items")
    .select("*")
    .eq("collection_id", id)
    .eq("user_id", userId)
    .order("position", { ascending: true });

  return { collection, items: items ?? [] };
}

export async function createCollection(supabase: Client, userId: string, input: CollectionInput) {
  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      icon_mark: input.iconMark,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "collection",
    verb: "started",
    summary: input.name,
    entityTable: "collections",
    entityId: data.id,
  });

  return data;
}

export async function updateCollection(
  supabase: Client,
  userId: string,
  id: string,
  input: CollectionInput,
) {
  const { data, error } = await supabase
    .from("collections")
    .update({
      name: input.name,
      description: input.description || null,
      icon_mark: input.iconMark,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCollection(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function addCollectionItem(
  supabase: Client,
  userId: string,
  collectionId: string,
  input: CollectionItemInput,
) {
  const { count } = await supabase
    .from("collection_items")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", collectionId)
    .eq("user_id", userId);

  const { data, error } = await supabase
    .from("collection_items")
    .insert({
      user_id: userId,
      collection_id: collectionId,
      title: input.title,
      note: input.note || null,
      url: input.url || null,
      is_done: input.isDone,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCollectionItem(
  supabase: Client,
  userId: string,
  id: string,
  input: CollectionItemInput,
) {
  const { data, error } = await supabase
    .from("collection_items")
    .update({
      title: input.title,
      note: input.note || null,
      url: input.url || null,
      is_done: input.isDone,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleCollectionItemDone(
  supabase: Client,
  userId: string,
  id: string,
  isDone: boolean,
) {
  const { data, error } = await supabase
    .from("collection_items")
    .update({ is_done: isDone })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCollectionItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function reorderCollectionItems(supabase: Client, userId: string, ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("collection_items")
        .update({ position: index })
        .eq("id", id)
        .eq("user_id", userId),
    ),
  );
}
