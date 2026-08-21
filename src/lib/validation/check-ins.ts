import { z } from "zod";

export const checkInSchema = z.object({
  entryDate: z.string().min(1, "Pick a date"),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  reflectionPrompt: z.string().max(280).optional(),
  reflection: z.string().max(4000).optional(),
  tags: z.array(z.string()).default([]),
});
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckInFormInput = z.input<typeof checkInSchema>;
