import { z } from "zod";

export const learningPathStatusValues = ["active", "completed", "paused"] as const;

export const learningPathSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(4000).optional(),
  skillId: z.string().optional(),
  status: z.enum(learningPathStatusValues),
});
export type LearningPathInput = z.infer<typeof learningPathSchema>;

export const courseStatusValues = ["not_started", "in_progress", "completed"] as const;

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  provider: z.string().max(160).optional(),
  status: z.enum(courseStatusValues),
  progress: z.coerce.number().int().min(0).max(100),
  url: z.string().max(500).optional(),
  learningPathId: z.string().optional(),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  kind: z.string().min(1, "Kind is required").max(60),
  url: z.string().max(500).optional(),
  note: z.string().max(2000).optional(),
  isSavedForLater: z.boolean(),
});
export type ResourceInput = z.infer<typeof resourceSchema>;
