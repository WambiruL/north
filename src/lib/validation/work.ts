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
