import { z } from "zod";

export const experienceSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  organization: z.string().min(1, "Organization is required").max(160),
  location: z.string().max(160).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  narrative: z.string().max(8000).optional(),
  skillIds: z.array(z.string()),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(4000).optional(),
  occurredOn: z.string().min(1, "Date is required"),
  experienceId: z.string().optional(),
});
export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const goalStatusValues = ["active", "achieved", "abandoned"] as const;

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(4000).optional(),
  targetDate: z.string().optional(),
  status: z.enum(goalStatusValues),
});
export type GoalInput = z.infer<typeof goalSchema>;
