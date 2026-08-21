import { z } from "zod";

export const lifeAreaSchema = z.object({
  name: z.string().min(1, "Give it a name"),
  belief: z.string().max(2000).optional(),
});
export type LifeAreaInput = z.infer<typeof lifeAreaSchema>;

export const dreamHorizonValues = ["this_year", "1_3_years", "someday"] as const;
export const dreamSchema = z.object({
  title: z.string().min(1, "Give your dream a title"),
  description: z.string().max(4000).optional(),
  horizon: z.enum(dreamHorizonValues),
  lifeAreaId: z.string().uuid().optional(),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
export type DreamInput = z.infer<typeof dreamSchema>;

export const dreamGoalSchema = z.object({
  dreamId: z.string().uuid("Pick a dream"),
  title: z.string().min(1, "Give this goal a title"),
  targetDate: z.string().optional().or(z.literal("")),
});
export type DreamGoalInput = z.infer<typeof dreamGoalSchema>;

export const visionItemSchema = z.object({
  caption: z.string().min(1, "Add a caption"),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  dreamId: z.string().uuid().optional(),
});
export type VisionItemInput = z.infer<typeof visionItemSchema>;
