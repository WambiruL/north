import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  listAccounts,
  listTransactionsWithAccount,
  getFinancialSnapshot,
} from "@/services/finances";
import { FinancesClient } from "@/components/finances/finances-client";

export const metadata: Metadata = { title: "Finances" };

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <FinancesClient
        accounts={[]}
        transactions={[]}
        savingsGoals={[]}
        workProjects={[]}
        snapshot={{ totalBalance: 0, monthIncome: 0, monthExpense: 0 }}
        autoOpenTransaction={false}
      />
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const timezone = profile?.timezone || "UTC";

  const [accounts, transactions, snapshot, { data: workProjects }] = await Promise.all([
    listAccounts(supabase, user.id),
    listTransactionsWithAccount(supabase, user.id),
    getFinancialSnapshot(supabase, user.id, timezone),
    supabase.from("work_projects").select("id, name").eq("user_id", user.id),
  ]);

  return (
    <FinancesClient
      accounts={accounts}
      transactions={transactions}
      savingsGoals={snapshot.savingsGoals}
      workProjects={workProjects ?? []}
      snapshot={{
        totalBalance: snapshot.totalBalance,
        monthIncome: snapshot.monthIncome,
        monthExpense: snapshot.monthExpense,
      }}
      autoOpenTransaction={newParam === "transaction"}
    />
  );
}
