import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getBookDetail } from "@/services/books";
import { BookDetailPage } from "@/components/hobbies/books/book-detail-page";

export const metadata: Metadata = { title: "Book" };

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string; bookId: string }>;
}) {
  const { id, bookId } = await params;
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;
  if (!user) notFound();

  const detail = await getBookDetail(supabase, user.id, bookId);
  if (!detail) notFound();

  return <BookDetailPage hobbyId={id} book={detail.book} logs={detail.logs} />;
}
