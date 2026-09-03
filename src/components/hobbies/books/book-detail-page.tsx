"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCover } from "@/components/hobbies/books/book-cover";
import { BookDialog } from "@/components/hobbies/books/book-dialog";
import { ReadingLogDialog } from "@/components/hobbies/books/reading-log-dialog";
import { StarDisplay } from "@/components/hobbies/shared/star-rating";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeBook, removeReadingLog, finishBook } from "@/server/actions/books";

type Book = Tables<"books">;
type ReadingLog = Tables<"reading_logs">;

const STATUS_LABEL: Record<string, string> = {
  want_to_read: "Want to read",
  reading: "Currently reading",
  read: "Read",
};

export function BookDetailPage({
  hobbyId,
  book,
  logs,
}: {
  hobbyId: string;
  book: Book;
  logs: ReadingLog[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  async function handleDelete() {
    const ok = await confirm({ title: `Delete "${book.title}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeBook(hobbyId, book.id);
    toast.success("Removed from your shelf");
    router.push(`/hobbies/${hobbyId}`);
  }

  async function handleDeleteLog(id: string) {
    const ok = await confirm({ title: "Delete this log entry?", description: "This can't be undone." });
    if (!ok) return;
    await removeReadingLog(hobbyId, book.id, id);
    toast.success("Removed");
    router.refresh();
  }

  async function handleFinish() {
    await finishBook(hobbyId, book.id);
    toast.success("Nice — marked as read");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <Link
        href={`/hobbies/${hobbyId}`}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to bookshelf
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-[140px] shrink-0 self-start sm:w-[160px]">
          <BookCover id={book.id} title={book.title} coverUrl={book.cover_url} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold leading-tight text-ink">{book.title}</h1>
              {book.author && <p className="mt-1 text-[15px] text-muted">{book.author}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>

          <Badge variant={book.status === "read" ? "default" : book.status === "reading" ? "teal" : "outline"} className="w-fit">
            {STATUS_LABEL[book.status] ?? book.status}
          </Badge>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted">
            {book.started_on && <span>Started {format(parseISO(book.started_on), "d MMM yyyy")}</span>}
            {book.finished_on && <span>Finished {format(parseISO(book.finished_on), "d MMM yyyy")}</span>}
          </div>

          {book.rating != null && book.rating > 0 && <StarDisplay value={book.rating} size="md" />}

          {book.notes && <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{book.notes}</p>}

          {book.status === "reading" && (
            <Button variant="secondary" size="sm" className="w-fit" onClick={handleFinish}>
              Mark as finished
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-ink">Reading log</h2>
          <Button variant="secondary" size="sm" onClick={() => setLogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add entry
          </Button>
        </div>

        {logs.length === 0 ? (
          <p className="text-[13.5px] text-muted">Nothing logged yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <div key={log.id} className="rounded-[14px] border border-line bg-surface p-4">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[12.5px] font-bold text-muted">
                    {format(parseISO(log.occurred_on), "d MMMM")}
                    {log.page != null && ` · p.${log.page}`}
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-[11.5px] font-bold text-faint hover:text-mahogany"
                  >
                    Delete
                  </button>
                </div>
                {log.note && <p className="text-[14px] leading-relaxed text-ink">{log.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <BookDialog open={editOpen} onOpenChange={setEditOpen} hobbyId={hobbyId} book={book} />
      <ReadingLogDialog open={logOpen} onOpenChange={setLogOpen} hobbyId={hobbyId} bookId={book.id} />
    </div>
  );
}
