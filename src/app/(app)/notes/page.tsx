import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listNotes } from "@/services/notes";
import { NotesClient } from "@/components/notes/notes-client";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const notes = user ? await listNotes(supabase, user.id) : [];

  return <NotesClient notes={notes} autoOpen={newParam === "note"} />;
}
