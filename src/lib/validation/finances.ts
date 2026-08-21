import { z } from "zod";

export const accountKinds = ["checking", "savings", "credit", "cash", "investment"] as const;

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  kind: z.enum(accountKinds).default("checking"),
  currency: z.string().min(1).max(8).default("USD"),
  balance: z.coerce.number().default(0),
});
export type AccountInput = z.infer<typeof accountSchema>;

export const transactionSchema = z.object({
  accountId: z.string().uuid("Pick an account"),
  workProjectId: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Description is required").max(200),
  category: z.string().max(80).default("general"),
  amount: z.coerce.number().refine((v) => v !== 0, "Amount can't be zero"),
  occurredOn: z.string().min(1, "Pick a date"),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  savedAmount: z.coerce.number().min(0).default(0),
  targetDate: z.string().optional().nullable(),
});
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
