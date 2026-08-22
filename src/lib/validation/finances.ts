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
  mood: z.string().max(40).optional(),
  note: z.string().max(2000).optional(),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  savedAmount: z.coerce.number().min(0).default(0),
  targetDate: z.string().optional().nullable(),
  note: z.string().max(2000).optional(),
});
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;

export const incomeSourceKinds = ["salary", "freelance", "other"] as const;
export const incomeFrequencies = ["monthly", "weekly", "biweekly", "yearly", "one_time"] as const;

export const incomeSourceSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  kind: z.enum(incomeSourceKinds).default("salary"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  frequency: z.enum(incomeFrequencies).default("monthly"),
  lastReceivedOn: z.string().optional().nullable(),
});
export type IncomeSourceInput = z.infer<typeof incomeSourceSchema>;

export const budgetCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  monthlyLimit: z.coerce.number().min(0).optional().nullable(),
});
export type BudgetCategoryInput = z.infer<typeof budgetCategorySchema>;

export const budgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  category: z.string().max(80).optional(),
  limitAmount: z.coerce.number().positive("Limit must be greater than 0"),
  period: z.string().max(40).default("monthly"),
  note: z.string().max(2000).optional(),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const investmentKinds = ["brokerage", "retirement", "crypto", "other"] as const;

export const investmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  kind: z.enum(investmentKinds).default("brokerage"),
  value: z.coerce.number().min(0),
  costBasis: z.coerce.number().min(0).optional().nullable(),
  contributionAmount: z.coerce.number().min(0).optional().nullable(),
  contributionFrequency: z.string().max(40).optional(),
});
export type InvestmentInput = z.infer<typeof investmentSchema>;

export const upcomingItemKinds = ["bill", "income", "renewal", "other"] as const;

export const upcomingItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  kind: z.enum(upcomingItemKinds).default("bill"),
  dueDate: z.string().min(1, "Pick a date"),
  amount: z.coerce.number().optional().nullable(),
});
export type UpcomingItemInput = z.infer<typeof upcomingItemSchema>;

export const reflectionSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(300),
  body: z.string().min(1, "Say something").max(8000),
  occurredOn: z.string().min(1, "Pick a date"),
});
export type ReflectionInput = z.infer<typeof reflectionSchema>;

export const intentionSchema = z.object({
  intention: z.string().max(2000).default(""),
});
export type IntentionInput = z.infer<typeof intentionSchema>;
