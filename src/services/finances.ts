import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { AccountInput, TransactionInput, SavingsGoalInput } from "@/lib/validation/finances";
import { logActivity } from "@/services/activity";

type Client = SupabaseClient<Database>;

// ---------- Accounts ----------

export async function listAccounts(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function createAccount(supabase: Client, userId: string, input: AccountInput) {
  const { data, error } = await supabase
    .from("financial_accounts")
    .insert({
      user_id: userId,
      name: input.name,
      kind: input.kind,
      currency: input.currency,
      balance: input.balance,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAccount(
  supabase: Client,
  userId: string,
  id: string,
  input: AccountInput,
) {
  const { data, error } = await supabase
    .from("financial_accounts")
    .update({
      name: input.name,
      kind: input.kind,
      currency: input.currency,
      balance: input.balance,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAccount(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("financial_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

async function adjustAccountBalance(
  supabase: Client,
  userId: string,
  accountId: string,
  delta: number,
) {
  if (delta === 0) return;
  const { data: account, error } = await supabase
    .from("financial_accounts")
    .select("balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);

  const { error: updateError } = await supabase
    .from("financial_accounts")
    .update({ balance: Number(account.balance) + delta })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (updateError) throw new Error(updateError.message);
}

// ---------- Transactions ----------

export async function listTransactionsWithAccount(supabase: Client, userId: string, limit = 100) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, account:financial_accounts(id, name)")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTransaction(supabase: Client, userId: string, input: TransactionInput) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: input.accountId,
      work_project_id: input.workProjectId ?? null,
      description: input.description,
      category: input.category,
      amount: input.amount,
      occurred_on: input.occurredOn,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await adjustAccountBalance(supabase, userId, input.accountId, input.amount);

  await logActivity(supabase, {
    userId,
    module: "finance",
    verb: "logged",
    summary: `${input.description} (${input.amount > 0 ? "+" : ""}${input.amount})`,
    entityTable: "transactions",
    entityId: data.id,
  });

  return data;
}

export async function updateTransaction(
  supabase: Client,
  userId: string,
  id: string,
  input: TransactionInput,
) {
  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { data, error } = await supabase
    .from("transactions")
    .update({
      account_id: input.accountId,
      work_project_id: input.workProjectId ?? null,
      description: input.description,
      category: input.category,
      amount: input.amount,
      occurred_on: input.occurredOn,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (existing.account_id === input.accountId) {
    await adjustAccountBalance(
      supabase,
      userId,
      input.accountId,
      input.amount - Number(existing.amount),
    );
  } else {
    await adjustAccountBalance(supabase, userId, existing.account_id, -Number(existing.amount));
    await adjustAccountBalance(supabase, userId, input.accountId, input.amount);
  }

  return data;
}

export async function deleteTransaction(supabase: Client, userId: string, id: string) {
  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  await adjustAccountBalance(supabase, userId, existing.account_id, -Number(existing.amount));
}

// ---------- Savings goals ----------

export async function listSavingsGoals(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function createSavingsGoal(supabase: Client, userId: string, input: SavingsGoalInput) {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: userId,
      name: input.name,
      target_amount: input.targetAmount,
      saved_amount: input.savedAmount,
      target_date: input.targetDate ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "finance",
    verb: "set a goal",
    summary: input.name,
    entityTable: "savings_goals",
    entityId: data.id,
  });

  return data;
}

export async function updateSavingsGoal(
  supabase: Client,
  userId: string,
  id: string,
  input: SavingsGoalInput,
) {
  const { data, error } = await supabase
    .from("savings_goals")
    .update({
      name: input.name,
      target_amount: input.targetAmount,
      saved_amount: input.savedAmount,
      target_date: input.targetDate ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSavingsGoal(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Snapshot ----------

export async function getFinancialSnapshot(supabase: Client, userId: string) {
  const [{ data: accounts }, { data: goals }] = await Promise.all([
    supabase.from("financial_accounts").select("balance").eq("user_id", userId),
    supabase.from("savings_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);

  const totalBalance = (accounts ?? []).reduce((sum, a) => sum + Number(a.balance), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .gte("occurred_on", monthStart);

  let income = 0;
  let expense = 0;
  for (const t of monthTransactions ?? []) {
    const amount = Number(t.amount);
    if (amount > 0) income += amount;
    else expense += Math.abs(amount);
  }

  const savingsGoals = (goals ?? []).map((goal) => ({
    ...goal,
    progress:
      Number(goal.target_amount) > 0
        ? Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100))
        : 0,
  }));

  return {
    totalBalance,
    monthIncome: income,
    monthExpense: expense,
    savingsGoals,
  };
}
