import { z } from "zod";

export const checkInSchema = z.object({
  entryDate: z.string().min(1, "Pick a date"),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  intention: z.string().max(60).optional(),
  feeling: z.string().max(2000).optional(),
  challenge: z.string().max(2000).optional(),
  grateful: z.string().max(2000).optional(),
  mattersTomorrow: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
});
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckInFormInput = z.input<typeof checkInSchema>;
