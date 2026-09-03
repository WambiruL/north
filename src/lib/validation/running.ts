import { z } from "zod";

export const runSchema = z.object({
  occurredOn: z.string().min(1, "Pick a date"),
  distanceKm: z.coerce.number().positive("Add a distance"),
  durationMinutes: z.coerce.number().positive("Add a time"),
  route: z.string().max(160).optional(),
  feeling: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});
export type RunInput = z.infer<typeof runSchema>;
