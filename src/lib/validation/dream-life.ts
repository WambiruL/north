import { z } from "zod";

export const lifeAreaSchema = z.object({
  name: z.string().min(1, "Give it a name"),
  question: z.string().max(300).optional(),
  belief: z.string().max(2000).optional(),
  practices: z.array(z.string()).max(20).optional(),
});
export type LifeAreaInput = z.infer<typeof lifeAreaSchema>;

export const dreamHorizonValues = ["this_year", "1_3_years", "someday"] as const;
export const dreamHorizonLabels: Record<(typeof dreamHorizonValues)[number], string> = {
  this_year: "This year",
  "1_3_years": "1-3 years",
  someday: "Someday",
};

const milestoneRowSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Give this milestone a name"),
  isDone: z.boolean().optional(),
});

const actionRowSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "What's the next step?"),
});

export const dreamSchema = z.object({
  title: z.string().min(1, "Give your dream a title"),
  vision: z.string().max(4000).optional(),
  goalStatement: z.string().max(500).optional(),
  horizon: z.enum(dreamHorizonValues),
  lifeAreaId: z.string().uuid().optional(),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  milestones: z.array(milestoneRowSchema).max(30).optional(),
  actions: z.array(actionRowSchema).max(30).optional(),
});
export type DreamInput = z.infer<typeof dreamSchema>;
export type DreamMilestoneRow = z.infer<typeof milestoneRowSchema>;
export type DreamActionRow = z.infer<typeof actionRowSchema>;

export const dreamGoalKindValues = ["milestone", "action"] as const;
export const dreamGoalSchema = z.object({
  dreamId: z.string().uuid("Pick a dream"),
  title: z.string().min(1, "Give this goal a title"),
  kind: z.enum(dreamGoalKindValues).default("milestone"),
  targetDate: z.string().optional().or(z.literal("")),
});
export type DreamGoalInput = z.infer<typeof dreamGoalSchema>;

export const visionItemSchema = z.object({
  caption: z.string().min(1, "Add a caption"),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  dreamId: z.string().uuid().optional(),
  lifeAreaId: z.string().uuid().optional(),
});
export type VisionItemInput = z.infer<typeof visionItemSchema>;

export const futureHorizonSchema = z.object({
  whenLabel: z.string().min(1, "When is this?"),
  whereText: z.string().min(1, "Where do you find yourself?"),
  achieved: z.string().max(2000).optional(),
  learned: z.string().max(2000).optional(),
  feels: z.string().max(2000).optional(),
});
export type FutureHorizonInput = z.infer<typeof futureHorizonSchema>;

export const bucketListStatusValues = ["someday", "planned", "done"] as const;
export const bucketListStatusLabels: Record<(typeof bucketListStatusValues)[number], string> = {
  someday: "Someday",
  planned: "Planned",
  done: "Done",
};
export const bucketListItemSchema = z.object({
  title: z.string().min(1, "What is it?"),
  category: z.string().max(80).optional(),
  why: z.string().max(1000).optional(),
  status: z.enum(bucketListStatusValues).default("someday"),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
export type BucketListItemInput = z.infer<typeof bucketListItemSchema>;
export type BucketListItemFormInput = z.input<typeof bucketListItemSchema>;

export const manifestoPrincipleSchema = z.object({
  kind: z.string().min(1, "Give it a short label").max(60),
  text: z.string().min(1, "What's the principle?").max(1000),
});
export type ManifestoPrincipleInput = z.infer<typeof manifestoPrincipleSchema>;

export const futureLetterSchema = z.object({
  prompt: z.string().min(1).max(200),
  body: z.string().min(1, "Write something to your future self"),
});
export type FutureLetterInput = z.infer<typeof futureLetterSchema>;
