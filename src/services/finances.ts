import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  AccountInput,
  TransactionInput,
  SavingsGoalInput,
  IncomeSourceInput,
  BudgetCategoryInput,
  BudgetInput,
  InvestmentInput,
  UpcomingItemInput,
  ReflectionInput,
} from "@/lib/validation/finances";
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
      mood: input.mood ?? null,
      note: input.note ?? null,
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
      mood: input.mood ?? null,
      note: input.note ?? null,
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
      note: input.note ?? null,
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
      note: input.note ?? null,
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

// ---------- Income sources ----------

export async function listIncomeSources(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .order("amount", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createIncomeSource(supabase: Client, userId: string, input: IncomeSourceInput) {
  const { data, error } = await supabase
    .from("income_sources")
    .insert({
      user_id: userId,
      name: input.name,
      kind: input.kind,
      amount: input.amount,
      frequency: input.frequency,
      last_received_on: input.lastReceivedOn ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "finance",
    verb: "added an income source",
    summary: input.name,
    entityTable: "income_sources",
    entityId: data.id,
  });

  return data;
}

export async function updateIncomeSource(
  supabase: Client,
  userId: string,
  id: string,
  input: IncomeSourceInput,
) {
  const { data, error } = await supabase
    .from("income_sources")
    .update({
      name: input.name,
      kind: input.kind,
      amount: input.amount,
      frequency: input.frequency,
      last_received_on: input.lastReceivedOn ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteIncomeSource(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("income_sources").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Budget categories ----------

export async function listBudgetCategories(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createBudgetCategory(
  supabase: Client,
  userId: string,
  input: BudgetCategoryInput,
) {
  const { data, error } = await supabase
    .from("budget_categories")
    .insert({ user_id: userId, name: input.name, monthly_limit: input.monthlyLimit ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBudgetCategory(
  supabase: Client,
  userId: string,
  id: string,
  input: BudgetCategoryInput,
) {
  const { data, error } = await supabase
    .from("budget_categories")
    .update({ name: input.name, monthly_limit: input.monthlyLimit ?? null })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBudgetCategory(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("budget_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Budgets ("plans") ----------

export async function listBudgets(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createBudget(supabase: Client, userId: string, input: BudgetInput) {
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category ?? null,
      limit_amount: input.limitAmount,
      period: input.period,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "finance",
    verb: "created a plan",
    summary: input.name,
    entityTable: "budgets",
    entityId: data.id,
  });

  return data;
}

export async function updateBudget(supabase: Client, userId: string, id: string, input: BudgetInput) {
  const { data, error } = await supabase
    .from("budgets")
    .update({
      name: input.name,
      category: input.category ?? null,
      limit_amount: input.limitAmount,
      period: input.period,
      note: input.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBudget(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Investment holdings ----------

export async function listInvestments(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("investment_holdings")
    .select("*")
    .eq("user_id", userId)
    .order("value", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createInvestment(supabase: Client, userId: string, input: InvestmentInput) {
  const { data, error } = await supabase
    .from("investment_holdings")
    .insert({
      user_id: userId,
      name: input.name,
      kind: input.kind,
      value: input.value,
      cost_basis: input.costBasis ?? null,
      contribution_amount: input.contributionAmount ?? null,
      contribution_frequency: input.contributionFrequency ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    userId,
    module: "finance",
    verb: "recorded a holding",
    summary: input.name,
    entityTable: "investment_holdings",
    entityId: data.id,
  });

  return data;
}

export async function updateInvestment(
  supabase: Client,
  userId: string,
  id: string,
  input: InvestmentInput,
) {
  const { data, error } = await supabase
    .from("investment_holdings")
    .update({
      name: input.name,
      kind: input.kind,
      value: input.value,
      cost_basis: input.costBasis ?? null,
      contribution_amount: input.contributionAmount ?? null,
      contribution_frequency: input.contributionFrequency ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInvestment(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("investment_holdings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Upcoming items (bills, renewals, etc.) ----------

export async function listUpcomingItems(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("upcoming_items")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createUpcomingItem(supabase: Client, userId: string, input: UpcomingItemInput) {
  const { data, error } = await supabase
    .from("upcoming_items")
    .insert({
      user_id: userId,
      title: input.title,
      kind: input.kind,
      due_date: input.dueDate,
      amount: input.amount ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUpcomingItem(
  supabase: Client,
  userId: string,
  id: string,
  input: UpcomingItemInput,
) {
  const { data, error } = await supabase
    .from("upcoming_items")
    .update({
      title: input.title,
      kind: input.kind,
      due_date: input.dueDate,
      amount: input.amount ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUpcomingItem(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("upcoming_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Reflections ----------

export async function listReflections(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("financial_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReflection(supabase: Client, userId: string, input: ReflectionInput) {
  const { data, error } = await supabase
    .from("financial_reflections")
    .insert({
      user_id: userId,
      prompt: input.prompt,
      body: input.body,
      occurred_on: input.occurredOn,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateReflection(
  supabase: Client,
  userId: string,
  id: string,
  input: ReflectionInput,
) {
  const { data, error } = await supabase
    .from("financial_reflections")
    .update({ prompt: input.prompt, body: input.body, occurred_on: input.occurredOn })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteReflection(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("financial_reflections")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ---------- Intention (singleton per user) ----------

export async function getIntention(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("finance_intentions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.intention ?? "";
}

export async function saveIntention(supabase: Client, userId: string, intention: string) {
  const { error } = await supabase
    .from("finance_intentions")
    .upsert({ user_id: userId, intention, updated_at: new Date().toISOString() });
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
    .select("amount, category")
    .eq("user_id", userId)
    .gte("occurred_on", monthStart);

  let income = 0;
  let expense = 0;
  const byCategory = new Map<string, number>();
  for (const t of monthTransactions ?? []) {
    const amount = Number(t.amount);
    if (amount > 0) {
      income += amount;
    } else {
      expense += Math.abs(amount);
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Math.abs(amount));
    }
  }

  const savingsGoals = (goals ?? []).map((goal) => ({
    ...goal,
    progress:
      Number(goal.target_amount) > 0
        ? Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100))
        : 0,
  }));

  const spendByCategory = Array.from(byCategory.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalBalance,
    monthIncome: income,
    monthExpense: expense,
    savingsGoals,
    spendByCategory,
  };
}
