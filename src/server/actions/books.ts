"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookSchema, readingLogSchema, type BookInput, type ReadingLogInput } from "@/lib/validation/books";
import * as bookService from "@/services/books";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveBook(hobbyId: string, input: BookInput, id?: string) {
  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    const book = id
      ? await bookService.updateBook(supabase, userId, id, parsed.data)
      : await bookService.createBook(supabase, userId, hobbyId, parsed.data);
    revalidatePath(`/hobbies/${hobbyId}`);
    if (id) revalidatePath(`/hobbies/${hobbyId}/books/${id}`);
    return { id: book.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function removeBook(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await bookService.deleteBook(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
}

export async function finishBook(hobbyId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await bookService.markBookFinished(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}`);
  revalidatePath(`/hobbies/${hobbyId}/books/${id}`);
}

export async function saveReadingLog(hobbyId: string, bookId: string, input: ReadingLogInput) {
  const parsed = readingLogSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();

  try {
    await bookService.createReadingLog(supabase, userId, bookId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath(`/hobbies/${hobbyId}/books/${bookId}`);
  return {};
}

export async function removeReadingLog(hobbyId: string, bookId: string, id: string) {
  const { supabase, userId } = await requireUser();
  await bookService.deleteReadingLog(supabase, userId, id);
  revalidatePath(`/hobbies/${hobbyId}/books/${bookId}`);
}
