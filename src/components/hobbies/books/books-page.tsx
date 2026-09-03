"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { BookCover } from "@/components/hobbies/books/book-cover";
import { BookDialog } from "@/components/hobbies/books/book-dialog";
import { finishBook } from "@/server/actions/books";

type Book = Tables<"books">;

function Shelf({ title, books, hobbyId }: { title: string; books: Book[]; hobbyId: string }) {
  if (books.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">{title}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {books.map((book) => (
          <Link key={book.id} href={`/hobbies/${hobbyId}/books/${book.id}`} className="group flex flex-col gap-1.5">
            <BookCover id={book.id} title={book.title} coverUrl={book.cover_url} className="transition-transform group-hover:-translate-y-1" />
            <span className="line-clamp-2 text-[12px] font-bold leading-snug text-ink">{book.title}</span>
            {book.author && <span className="line-clamp-1 text-[11px] text-faint">{book.author}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BooksPage({
  hobbyId,
  hobbyName,
  description,
  books,
}: {
  hobbyId: string;
  hobbyName: string;
  description: string | null;
  books: Book[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const reading = books.filter((b) => b.status === "reading");
  const wantToRead = books.filter((b) => b.status === "want_to_read");
  const read = books.filter((b) => b.status === "read");

  async function handleFinish(id: string) {
    await finishBook(hobbyId, id);
    toast.success("Nice — marked as read");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobbyName}
        description={description}
        action={
          <Button variant="accent" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add book
          </Button>
        }
      />

      {books.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Your bookshelf is empty."
          description="Add something you're reading or want to read."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Add book
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {reading.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Currently reading</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reading.map((book) => (
                  <div key={book.id} className="flex gap-4 rounded-[18px] border border-line bg-surface p-4 shadow-north-sm">
                    <Link href={`/hobbies/${hobbyId}/books/${book.id}`} className="w-[76px] shrink-0">
                      <BookCover id={book.id} title={book.title} coverUrl={book.cover_url} />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <Link href={`/hobbies/${hobbyId}/books/${book.id}`} className="line-clamp-2 text-[15px] font-bold text-ink hover:text-teal">
                          {book.title}
                        </Link>
                        {book.author && <div className="mt-0.5 text-[12.5px] text-faint">{book.author}</div>}
                        {book.started_on && (
                          <div className="mt-1.5 text-[11.5px] text-faint">
                            Started {format(parseISO(book.started_on), "d MMM yyyy")}
                          </div>
                        )}
                      </div>
                      <Button variant="secondary" size="sm" className="mt-3 w-fit" onClick={() => handleFinish(book.id)}>
                        Mark as finished
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Shelf title="Want to read" books={wantToRead} hobbyId={hobbyId} />
          <Shelf title="Read" books={read} hobbyId={hobbyId} />
        </div>
      )}

      <BookDialog open={dialogOpen} onOpenChange={setDialogOpen} hobbyId={hobbyId} />
    </div>
  );
}
