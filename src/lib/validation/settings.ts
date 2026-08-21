import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Tell us what to call you").max(120),
  city: z.string().trim().max(120).optional(),
  timezone: z.string().trim().min(1).max(80),
});
export type ProfileInput = z.infer<typeof profileSchema>;
