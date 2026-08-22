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
  note: z.string().max(1000).optional(),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const shelfKindValues = ["book", "video", "podcast", "article", "course"] as const;
export const shelfStatusValues = ["queued", "in_progress", "completed"] as const;

export const shelfItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().max(160).optional(),
  kind: z.enum(shelfKindValues),
  status: z.enum(shelfStatusValues),
  url: z.string().max(500).optional(),
  note: z.string().max(2000).optional(),
  progressCurrent: z.coerce.number().int().min(0).max(100000).optional(),
  progressTotal: z.coerce.number().int().min(0).max(100000).optional(),
});
export type ShelfItemInput = z.infer<typeof shelfItemSchema>;
export type ShelfItemFormInput = z.input<typeof shelfItemSchema>;

export const momentSchema = z.object({
  occurredOn: z.string().min(1, "Date is required"),
  what: z.string().min(1, "This is required").max(300),
});
export type MomentInput = z.infer<typeof momentSchema>;

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  body: z.string().min(1, "Body is required").max(4000),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  linkedSkillId: z.string().optional(),
});
export type NoteInput = z.infer<typeof noteSchema>;
export type NoteFormInput = z.input<typeof noteSchema>;

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  dueDate: z.string().optional(),
  skillsPractised: z.string().max(300).optional(),
  outcome: z.string().max(1000).optional(),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectFormInput = z.input<typeof projectSchema>;

export const sessionSchema = z.object({
  skillId: z.string().optional(),
  occurredOn: z.string().min(1, "Date is required"),
  minutes: z.coerce.number().int().min(1).max(1440),
  note: z.string().max(1000).optional(),
});
export type SessionInput = z.infer<typeof sessionSchema>;
export type SessionFormInput = z.input<typeof sessionSchema>;

export const journalEntrySchema = z.object({
  entryDate: z.string().min(1, "Date is required"),
  prompt: z.string().min(1, "Prompt is required").max(300),
  body: z.string().min(1, "Entry is required").max(4000),
});
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;

export const certificateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  issuingOrg: z.string().max(160).optional(),
  issuedOn: z.string().min(1, "Date is required"),
  note: z.string().max(1000).optional(),
  courseId: z.string().optional(),
});
export type CertificateInput = z.infer<typeof certificateSchema>;

export const curiosityStatusValues = ["not_started", "exploring", "parked"] as const;

export const curiositySchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200),
  why: z.string().max(1000).optional(),
  status: z.enum(curiosityStatusValues),
  resourcesGathered: z.string().max(1000).optional(),
});
export type CuriosityInput = z.infer<typeof curiositySchema>;

export const focusSchema = z.object({
  focus: z.string().max(2000).optional(),
});
export type FocusInput = z.infer<typeof focusSchema>;
