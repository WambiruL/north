import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { BookInput, ReadingLogInput } from "@/lib/validation/books";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

export async function listBooks(supabase: Client, userId: string, hobbyId: string) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .eq("hobby_id", hobbyId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBookDetail(supabase: Client, userId: string, id: string) {
  const [{ data: book, error }, { data: logs }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    supabase
      .from("reading_logs")
      .select("*")
      .eq("book_id", id)
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false }),
  ]);
  if (error) throw new Error(error.message);
  if (!book) return null;
  return { book, logs: logs ?? [] };
}

export async function createBook(supabase: Client, userId: string, hobbyId: string, input: BookInput) {
  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: userId,
      hobby_id: hobbyId,
      title: input.title,
      author: input.author ?? null,
      cover_url: input.coverUrl ?? null,
      status: input.status,
      started_on: input.startedOn ?? null,
      finished_on: input.finishedOn ?? null,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: input.status === "reading" ? "started reading" : "added",
    summary: input.title,
    entityTable: "books",
    entityId: data.id,
  });

  return data;
}

export async function updateBook(supabase: Client, userId: string, id: string, input: BookInput) {
  const { data, error } = await supabase
    .from("books")
    .update({
      title: input.title,
      author: input.author ?? null,
      cover_url: input.coverUrl ?? null,
      status: input.status,
      started_on: input.startedOn ?? null,
      finished_on: input.finishedOn ?? null,
      rating: input.rating ?? null,
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

export async function markBookFinished(supabase: Client, userId: string, id: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("books")
    .update({ status: "read", finished_on: today, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "hobbies",
    verb: "finished reading",
    summary: data.title,
    entityTable: "books",
    entityId: id,
  });

  return data;
}

export async function deleteBook(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("books").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createReadingLog(
  supabase: Client,
  userId: string,
  bookId: string,
  input: ReadingLogInput,
) {
  const { data, error } = await supabase
    .from("reading_logs")
    .insert({
      user_id: userId,
      book_id: bookId,
      occurred_on: input.occurredOn,
      note: input.note ?? null,
      page: input.page ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteReadingLog(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("reading_logs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
