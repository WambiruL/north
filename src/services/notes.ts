import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { NoteInput } from "@/lib/validation/notes";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listNotes(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function createNote(supabase: Client, userId: string, input: NoteInput) {
  const title = input.title.trim() || "Untitled";
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title,
      body: input.body,
      pinned: input.pinned,
      tags: input.tags,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "note",
    verb: "wrote",
    summary: title,
    entityTable: "notes",
    entityId: data.id,
  });

  return data;
}

export async function updateNote(
  supabase: Client,
  userId: string,
  id: string,
  input: NoteInput,
) {
  const title = input.title.trim() || "Untitled";
  const { data, error } = await supabase
    .from("notes")
    .update({
      title,
      body: input.body,
      pinned: input.pinned,
      tags: input.tags,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNote(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("notes").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function togglePinned(
  supabase: Client,
  userId: string,
  id: string,
  pinned: boolean,
) {
  const { data, error } = await supabase
    .from("notes")
    .update({ pinned })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
