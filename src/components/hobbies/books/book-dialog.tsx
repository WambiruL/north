"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { bookSchema, bookStatuses, type BookInput } from "@/lib/validation/books";
import { saveBook } from "@/server/actions/books";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/hobbies/shared/image-upload";
import { StarRating } from "@/components/hobbies/shared/star-rating";

type Book = Tables<"books">;

const STATUS_LABEL: Record<(typeof bookStatuses)[number], string> = {
  want_to_read: "Want to read",
  reading: "Currently reading",
  read: "Read",
};

function toDefaults(book?: Book): BookInput {
  if (book) {
    return {
      title: book.title,
      author: book.author ?? undefined,
      coverUrl: book.cover_url ?? null,
      status: book.status as BookInput["status"],
      startedOn: book.started_on ?? undefined,
      finishedOn: book.finished_on ?? undefined,
      rating: book.rating ?? undefined,
      notes: book.notes ?? undefined,
    };
  }
  return { title: "", author: "", coverUrl: null, status: "want_to_read", notes: "" };
}

export function BookDialog({
  open,
  onOpenChange,
  hobbyId,
  book,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobbyId: string;
  book?: Book;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset, watch } = useForm<BookInput>({
    resolver: zodResolver(bookSchema) as unknown as Resolver<BookInput>,
    values: toDefaults(book),
  });
  const status = watch("status");

  async function onSubmit(values: BookInput) {
    setSubmitting(true);
    const result = await saveBook(hobbyId, values, book?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(book ? "Book updated" : "Added to your shelf");
    router.refresh();
    onOpenChange(false);
    if (!book) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{book ? "Edit book" : "Add book"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[110px_1fr]">
            <Controller
              control={control}
              name="coverUrl"
              render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} label="Cover" aspect="aspect-[2/3]" />
              )}
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="The Name of the Rose" {...register("title")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="author">Author</Label>
                <Input id="author" {...register("author")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bookStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {status === "read" && (
            <div className="flex flex-col gap-1.5">
              <Label>Your rating</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => <StarRating value={field.value ?? 0} onChange={field.onChange} />}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes {status === "want_to_read" ? "(optional — e.g. \"recommended by Sarah\")" : ""}</Label>
            <Textarea id="notes" rows={2} {...register("notes")} placeholder="Optional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : book ? "Save changes" : "Add book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
