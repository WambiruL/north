import { z } from "zod";

export const photoSchema = z.object({
  imageUrl: z.string().min(1, "Add a photo"),
  caption: z.string().max(400).optional(),
  location: z.string().max(160).optional(),
  occurredOn: z.string().min(1, "Pick a date"),
  seriesId: z.string().uuid().optional().nullable(),
  isFavorite: z.boolean().default(false),
});
export type PhotoInput = z.infer<typeof photoSchema>;

export const photoSeriesSchema = z.object({
  title: z.string().min(1, "Give the series a name").max(160),
});
export type PhotoSeriesInput = z.infer<typeof photoSeriesSchema>;
