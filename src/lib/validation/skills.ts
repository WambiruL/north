import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  category: z.string().max(80).optional(),
  proficiency: z.coerce.number().int().min(1).max(5),
});
export type SkillInput = z.infer<typeof skillSchema>;
