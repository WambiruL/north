import { z } from "zod";

export const hobbySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().max(1000).optional(),
  goal: z.string().max(280).optional(),
});
export type HobbyInput = z.infer<typeof hobbySchema>;

export const hobbyProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  status: z.enum(["active", "completed", "abandoned"]),
  notes: z.string().max(4000).optional(),
});
export type HobbyProjectInput = z.infer<typeof hobbyProjectSchema>;

export const hobbyMemorySchema = z.object({
  caption: z.string().min(1, "Caption is required").max(280),
  imageUrl: z.string().max(1000).optional(),
  occurredOn: z.string().min(1, "Pick a date"),
  durationMinutes: z
    .union([z.coerce.number().int().min(0).max(1440), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});
export type HobbyMemoryInput = z.infer<typeof hobbyMemorySchema>;
export type HobbyMemoryFormInput = z.input<typeof hobbyMemorySchema>;

export const hobbyNoteSchema = z.object({
  body: z.string().min(1, "Write something first").max(4000),
});
export type HobbyNoteInput = z.infer<typeof hobbyNoteSchema>;
