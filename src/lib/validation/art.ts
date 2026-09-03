import { z } from "zod";

export const artworkStatuses = ["current", "finished", "idea"] as const;

export const artworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  imageUrl: z.string().max(2000).optional().nullable(),
  medium: z.string().max(120).optional(),
  dimensions: z.string().max(80).optional(),
  notes: z.string().max(4000).optional(),
  status: z.enum(artworkStatuses).default("current"),
  occurredOn: z.string().min(1, "Pick a date"),
});
export type ArtworkInput = z.infer<typeof artworkSchema>;
