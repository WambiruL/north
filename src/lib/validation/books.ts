import { z } from "zod";
import { optionalNumber } from "@/lib/validation/shared";

export const bookStatuses = ["want_to_read", "reading", "read"] as const;

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().max(160).optional(),
  coverUrl: z.string().max(2000).optional().nullable(),
  status: z.enum(bookStatuses).default("want_to_read"),
  startedOn: z.string().optional().nullable(),
  finishedOn: z.string().optional().nullable(),
  rating: optionalNumber(z.coerce.number().int().min(1).max(5)).nullable(),
  notes: z.string().max(4000).optional(),
});
export type BookInput = z.infer<typeof bookSchema>;

export const readingLogSchema = z.object({
  occurredOn: z.string().min(1, "Pick a date"),
  note: z.string().max(2000).optional(),
  page: optionalNumber(z.coerce.number().int().min(0)).nullable(),
});
export type ReadingLogInput = z.infer<typeof readingLogSchema>;
