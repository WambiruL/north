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
  seasonId: z.string().optional(),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(4000).optional(),
  occurredOn: z.string().min(1, "Date is required"),
  experienceId: z.string().optional(),
  kind: z.string().max(60).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
});
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type MilestoneFormInput = z.input<typeof milestoneSchema>;

export const goalStatusValues = ["active", "achieved", "abandoned"] as const;

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(4000).optional(),
  targetDate: z.string().optional(),
  status: z.enum(goalStatusValues),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  nextStep: z.string().max(400).optional(),
});
export type GoalInput = z.infer<typeof goalSchema>;
export type GoalFormInput = z.input<typeof goalSchema>;

export const seasonSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  chapter: z.string().max(160).optional(),
  startYear: z.coerce.number().int().min(1950).max(2100),
  endYear: z.coerce.number().int().min(1950).max(2100).optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(4000).optional(),
  wins: z.array(z.string().min(1).max(300)).max(12).default([]),
  lessons: z.string().max(2000).optional(),
});
export type SeasonInput = z.infer<typeof seasonSchema>;
export type SeasonFormInput = z.input<typeof seasonSchema>;

export const careerMapStages = [
  "Where it's been",
  "Where it is",
  "Could go next",
  "Someday, maybe",
] as const;

export const mapStepSchema = z.object({
  stage: z.string().min(1, "Stage is required").max(60),
  label: z.string().min(1, "Label is required").max(160),
  note: z.string().max(1000).optional(),
});
export type MapStepInput = z.infer<typeof mapStepSchema>;

export const statementContextValues = ["identity", "legacy"] as const;

export const statementSchema = z.object({
  context: z.enum(statementContextValues),
  kind: z.string().min(1, "Label is required").max(80),
  statement: z.string().min(1, "Statement is required").max(2000),
});
export type StatementInput = z.infer<typeof statementSchema>;

export const mentorSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  role: z.string().max(160).optional(),
  howHelped: z.string().max(2000).optional(),
  lesson: z.string().max(1000).optional(),
});
export type MentorInput = z.infer<typeof mentorSchema>;

export const reflectionSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(300),
  body: z.string().min(1, "Reflection is required").max(4000),
});
export type ReflectionInput = z.infer<typeof reflectionSchema>;

export const opportunitySchema = z.object({
  occurredOn: z.string().min(1, "Date is required"),
  what: z.string().min(1, "This is required").max(200),
  note: z.string().max(2000).optional(),
});
export type OpportunityInput = z.infer<typeof opportunitySchema>;

export const missionSchema = z.object({
  mission: z.string().max(2000).optional(),
});
export type MissionInput = z.infer<typeof missionSchema>;
