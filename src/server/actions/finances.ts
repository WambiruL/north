"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  accountSchema,
  transactionSchema,
  savingsGoalSchema,
  type AccountInput,
  type TransactionInput,
  type SavingsGoalInput,
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
