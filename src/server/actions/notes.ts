"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { noteSchema, type NoteInput } from "@/lib/validation/notes";
import * as noteService from "@/services/notes";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveNote(input: NoteInput, id?: string) {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await noteService.updateNote(supabase, userId, id, parsed.data);
    } else {
      await noteService.createNote(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return {};
}

export async function removeNote(id: string) {
  const { supabase, userId } = await requireUser();
  await noteService.deleteNote(supabase, userId, id);
  revalidatePath("/notes");
  revalidatePath("/dashboard");
}

export async function setPinned(id: string, pinned: boolean) {
  const { supabase, userId } = await requireUser();
  await noteService.togglePinned(supabase, userId, id, pinned);
  revalidatePath("/notes");
  revalidatePath("/dashboard");
}
