import { z } from "zod";

export const creativeProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(4000).optional(),
  status: z.enum(["active", "completed", "archived"]),
  coverUrl: z.string().max(1000).optional(),
});
export type CreativeProjectInput = z.infer<typeof creativeProjectSchema>;

export const creativeIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  note: z.string().max(4000).optional(),
  status: z.enum(["seed", "developing", "promoted", "dropped"]),
});
export type CreativeIdeaInput = z.infer<typeof creativeIdeaSchema>;

export const inspirationItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  sourceUrl: z.string().max(1000).optional(),
  imageUrl: z.string().max(1000).optional(),
  note: z.string().max(2000).optional(),
});
export type InspirationItemInput = z.infer<typeof inspirationItemSchema>;
