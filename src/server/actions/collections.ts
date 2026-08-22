"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  collectionSchema,
  collectionItemSchema,
  type CollectionInput,
  type CollectionItemInput,
} from "@/lib/validation/collections";
import * as collectionService from "@/services/collections";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateCollections(id?: string) {
  revalidatePath("/collections");
  if (id) revalidatePath(`/collections/${id}`);
  revalidatePath("/dashboard");
}

export async function saveCollection(input: CollectionInput, id?: string) {
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  let savedId = id;
  try {
    if (id) {
      await collectionService.updateCollection(supabase, userId, id, parsed.data);
    } else {
      const created = await collectionService.createCollection(supabase, userId, parsed.data);
      savedId = created.id;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateCollections(savedId);
  return { id: savedId };
}

export async function removeCollection(id: string) {
  const { supabase, userId } = await requireUser();
  await collectionService.deleteCollection(supabase, userId, id);
  revalidateCollections();
}

export async function saveCollectionItem(
  collectionId: string,
  input: CollectionItemInput,
  id?: string,
) {
  const parsed = collectionItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await collectionService.updateCollectionItem(supabase, userId, id, parsed.data);
    } else {
      await collectionService.addCollectionItem(supabase, userId, collectionId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateCollections(collectionId);
  return {};
}

export async function removeCollectionItem(collectionId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await collectionService.deleteCollectionItem(supabase, userId, id);
  revalidateCollections(collectionId);
}

export async function toggleItemDone(collectionId: string, id: string, isDone: boolean) {
  const { supabase, userId } = await requireUser();
  await collectionService.toggleCollectionItemDone(supabase, userId, id, isDone);
  revalidateCollections(collectionId);
}

export async function reorderItems(collectionId: string, ids: string[]) {
  const { supabase, userId } = await requireUser();
  await collectionService.reorderCollectionItems(supabase, userId, ids);
  revalidateCollections(collectionId);
}
