import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  category: z.string().max(80).optional(),
  proficiency: z.coerce.number().int().min(1).max(5),
  // Narrative fields shared by Career's "skill story" view and Learning's
  // "skill map" view — the same skill row, read two different ways.
  levelLabel: z.string().max(60).optional(),
  nextStep: z.string().max(400).optional(),
  evidence: z.string().max(2000).optional(),
  hoursLogged: z.coerce.number().min(0).max(100000).optional(),
  growthSteps: z.array(z.string().min(1).max(300)).max(20).optional(),
});
export type SkillInput = z.infer<typeof skillSchema>;
export type SkillFormInput = z.input<typeof skillSchema>;
