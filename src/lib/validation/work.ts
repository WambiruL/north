import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  notes: z.string().max(4000).optional(),
});
export type ClientInput = z.infer<typeof clientSchema>;

export const workProjectStatuses = ["active", "on_hold", "completed", "archived"] as const;

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  description: z.string().max(4000).optional(),
  clientId: z.string().uuid().optional().nullable(),
  status: z.enum(workProjectStatuses).default("active"),
  startDate: z.string().min(1, "Pick a start date"),
  dueDate: z.string().optional().nullable(),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  dueDate: z.string().optional().nullable(),
});
export type TaskInput = z.infer<typeof taskSchema>;

// A "priority" or "deadline" is a work_tasks row scoped to a project, with
// isPriority distinguishing a Today-tab focus card from a plain deadline.
export const focusTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  workProjectId: z.string().uuid("Pick a project"),
  dueDate: z.string().optional().nullable(),
  isPriority: z.boolean().default(false),
});
export type FocusTaskInput = z.infer<typeof focusTaskSchema>;

export const opportunityKinds = ["job", "freelance", "collab", "other"] as const;

export const opportunitySchema = z.object({
  kind: z.enum(opportunityKinds).default("freelance"),
  title: z.string().min(1, "Title is required").max(200),
  organization: z.string().max(160).optional(),
  status: z.string().max(60).default(""),
  dueDate: z.string().optional().nullable(),
  note: z.string().max(4000).optional(),
});
export type OpportunityInput = z.infer<typeof opportunitySchema>;

export const invoiceStatuses = ["draft", "sent", "paid", "overdue"] as const;

export const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  clientId: z.string().uuid().optional().nullable(),
  workProjectId: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  status: z.enum(invoiceStatuses).default("sent"),
  issuedOn: z.string().min(1, "Pick a date"),
  dueOn: z.string().optional().nullable(),
  paidOn: z.string().optional().nullable(),
  notes: z.string().max(4000).optional(),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const winSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  kind: z.string().max(60).optional(),
  note: z.string().max(4000).optional(),
  occurredOn: z.string().min(1, "Pick a date"),
});
export type WinInput = z.infer<typeof winSchema>;

export const workNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Say something about it").max(8000),
  metWith: z.string().max(200).optional(),
  workProjectId: z.string().uuid().optional().nullable(),
  occurredOn: z.string().min(1, "Pick a date"),
});
export type WorkNoteInput = z.infer<typeof workNoteSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  role: z.string().max(160).optional(),
  organization: z.string().max(160).optional(),
  howMet: z.string().max(400).optional(),
  note: z.string().max(4000).optional(),
  lastContactOn: z.string().optional().nullable(),
});
export type ContactInput = z.infer<typeof contactSchema>;
