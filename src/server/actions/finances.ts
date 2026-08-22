"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  accountSchema,
  transactionSchema,
  savingsGoalSchema,
  incomeSourceSchema,
  budgetCategorySchema,
  budgetSchema,
  investmentSchema,
  upcomingItemSchema,
  reflectionSchema,
  intentionSchema,
  type AccountInput,
  type TransactionInput,
  type SavingsGoalInput,
  type IncomeSourceInput,
  type BudgetCategoryInput,
  type BudgetInput,
  type InvestmentInput,
  type UpcomingItemInput,
  type ReflectionInput,
} from "@/lib/validation/finances";
import * as financesService from "@/services/finances";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateFinances() {
  revalidatePath("/finances");
}

export async function saveAccount(input: AccountInput, id?: string) {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateAccount(supabase, userId, id, parsed.data);
    } else {
      await financesService.createAccount(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeAccount(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteAccount(supabase, userId, id);
  revalidateFinances();
}

export async function saveTransaction(input: TransactionInput, id?: string) {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateTransaction(supabase, userId, id, parsed.data);
    } else {
      await financesService.createTransaction(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeTransaction(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteTransaction(supabase, userId, id);
  revalidateFinances();
}

export async function saveSavingsGoal(input: SavingsGoalInput, id?: string) {
  const parsed = savingsGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateSavingsGoal(supabase, userId, id, parsed.data);
    } else {
      await financesService.createSavingsGoal(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeSavingsGoal(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteSavingsGoal(supabase, userId, id);
  revalidateFinances();
}

// ---------- Income sources ----------

export async function saveIncomeSource(input: IncomeSourceInput, id?: string) {
  const parsed = incomeSourceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateIncomeSource(supabase, userId, id, parsed.data);
    } else {
      await financesService.createIncomeSource(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeIncomeSource(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteIncomeSource(supabase, userId, id);
  revalidateFinances();
}

// ---------- Budget categories ----------

export async function saveBudgetCategory(input: BudgetCategoryInput, id?: string) {
  const parsed = budgetCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateBudgetCategory(supabase, userId, id, parsed.data);
    } else {
      await financesService.createBudgetCategory(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeBudgetCategory(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteBudgetCategory(supabase, userId, id);
  revalidateFinances();
}

// ---------- Budgets ----------

export async function saveBudget(input: BudgetInput, id?: string) {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateBudget(supabase, userId, id, parsed.data);
    } else {
      await financesService.createBudget(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeBudget(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteBudget(supabase, userId, id);
  revalidateFinances();
}

// ---------- Investments ----------

export async function saveInvestment(input: InvestmentInput, id?: string) {
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateInvestment(supabase, userId, id, parsed.data);
    } else {
      await financesService.createInvestment(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeInvestment(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteInvestment(supabase, userId, id);
  revalidateFinances();
}

// ---------- Upcoming items ----------

export async function saveUpcomingItem(input: UpcomingItemInput, id?: string) {
  const parsed = upcomingItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateUpcomingItem(supabase, userId, id, parsed.data);
    } else {
      await financesService.createUpcomingItem(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeUpcomingItem(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteUpcomingItem(supabase, userId, id);
  revalidateFinances();
}

// ---------- Reflections ----------

export async function saveReflection(input: ReflectionInput, id?: string) {
  const parsed = reflectionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await financesService.updateReflection(supabase, userId, id, parsed.data);
    } else {
      await financesService.createReflection(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateFinances();
  return {};
}

export async function removeReflection(id: string) {
  const { supabase, userId } = await requireUser();
  await financesService.deleteReflection(supabase, userId, id);
  revalidateFinances();
}

// ---------- Intention ----------

export async function saveIntention(intention: string) {
  const parsed = intentionSchema.safeParse({ intention });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();
  await financesService.saveIntention(supabase, userId, parsed.data.intention);
  revalidateFinances();
  return {};
}
