"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Landmark, Pencil, PiggyBank, Plus, Trash2, Wallet } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountDialog } from "@/components/finances/account-dialog";
import { TransactionDialog } from "@/components/finances/transaction-dialog";
import { SavingsGoalDialog } from "@/components/finances/savings-goal-dialog";
import { removeAccount, removeSavingsGoal, removeTransaction } from "@/server/actions/finances";

type Account = Tables<"financial_accounts">;
type Transaction = Tables<"transactions"> & { account: { id: string; name: string } | null };
type SavingsGoal = Tables<"savings_goals"> & { progress: number };
type ProjectOption = { id: string; name: string };

const KIND_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit",
  cash: "Cash",
  investment: "Investment",
};

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function FinancesClient({
  accounts,
  transactions,
  savingsGoals,
  workProjects,
  snapshot,
  autoOpenTransaction,
}: {
  accounts: Account[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  workProjects: ProjectOption[];
  snapshot: { totalBalance: number; monthIncome: number; monthExpense: number };
  autoOpenTransaction: boolean;
}) {
  const router = useRouter();
  const [accountDialogOpen, setAccountDialogOpen] = useState(
    () => autoOpenTransaction && accounts.length === 0,
  );
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(
    () => autoOpenTransaction && accounts.length > 0,
  );
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>(undefined);

  function openNewTransaction() {
    if (accounts.length === 0) {
      toast.info("Add an account first.");
      setAccountDialogOpen(true);
      return;
    }
    setEditingTransaction(undefined);
    setTransactionDialogOpen(true);
  }

  async function handleDeleteAccount(id: string) {
    await removeAccount(id);
    toast.success("Account removed");
    router.refresh();
  }

  async function handleDeleteTransaction(id: string) {
    await removeTransaction(id);
    toast.success("Transaction removed");
    router.refresh();
  }

  async function handleDeleteGoal(id: string) {
    await removeSavingsGoal(id);
    toast.success("Goal removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">Finances</h1>
        <p className="mt-1 text-[13.5px] text-muted">Your financial compass.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-faint">
            Total balance
          </div>
          <div className="mt-2 text-[26px] font-bold tracking-tight text-ink">
            {usd.format(snapshot.totalBalance)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-faint">
            This month · in
          </div>
          <div className="mt-2 text-[26px] font-bold tracking-tight text-teal">
            {usd.format(snapshot.monthIncome)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-faint">
            This month · out
          </div>
          <div className="mt-2 text-[26px] font-bold tracking-tight text-mahogany">
            {usd.format(snapshot.monthExpense)}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold tracking-tight text-ink">Accounts</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingAccount(undefined);
              setAccountDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> New account
          </Button>
        </div>

        {accounts.length === 0 ? (
          <EmptyState
            icon={<Landmark className="h-8 w-8" />}
            title="No accounts yet"
            description="Add a checking, savings, or cash account to start tracking balances."
            action={
              <Button variant="accent" onClick={() => setAccountDialogOpen(true)}>
                Add an account
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-bold text-ink">{account.name}</div>
                  <Badge variant="outline" className="mt-1">
                    {KIND_LABELS[account.kind] ?? account.kind}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="mr-1 text-[15px] font-bold text-ink">
                    {usd.format(Number(account.balance))}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit account"
                    onClick={() => {
                      setEditingAccount(account);
                      setAccountDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete account"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold tracking-tight text-ink">Spending journal</h2>
          <Button variant="accent" size="sm" onClick={openNewTransaction}>
            <Plus className="h-3.5 w-3.5" /> New transaction
          </Button>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-8 w-8" />}
            title="No transactions yet"
            description="Log income and expenses to see them show up here."
            action={
              <Button variant="accent" onClick={openNewTransaction}>
                Log a transaction
              </Button>
            }
          />
        ) : (
          <Card className="flex flex-col divide-y divide-line">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold text-ink">
                    {t.description}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-faint">
                    <span>{format(parseISO(t.occurred_on), "d MMM yyyy")}</span>
                    {t.account && <span>{t.account.name}</span>}
                    <span>{t.category}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span
                    className={
                      "mr-1 text-[14px] font-bold " +
                      (t.amount >= 0 ? "text-teal" : "text-ink")
                    }
                  >
                    {t.amount >= 0 ? "+" : ""}
                    {usd.format(t.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit transaction"
                    onClick={() => {
                      setEditingTransaction(t);
                      setTransactionDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete transaction"
                    onClick={() => handleDeleteTransaction(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold tracking-tight text-ink">Savings goals</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingGoal(undefined);
              setGoalDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> New goal
          </Button>
        </div>

        {savingsGoals.length === 0 ? (
          <EmptyState
            icon={<PiggyBank className="h-8 w-8" />}
            title="No savings goals yet"
            description="Set a target to start tracking progress toward it."
            action={
              <Button variant="accent" onClick={() => setGoalDialogOpen(true)}>
                Set a goal
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {savingsGoals.map((goal) => (
              <Card key={goal.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold text-ink">{goal.name}</div>
                    {goal.target_date && (
                      <div className="text-[11.5px] text-faint">
                        By {format(parseISO(goal.target_date), "d MMM yyyy")}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit goal"
                      onClick={() => {
                        setEditingGoal(goal);
                        setGoalDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete goal"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Progress value={goal.progress} tone="amber" />
                <div className="flex items-center justify-between text-[12px] text-muted">
                  <span>{usd.format(Number(goal.saved_amount))}</span>
                  <span>{usd.format(Number(goal.target_amount))}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} account={editingAccount} />
      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        transaction={editingTransaction}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        workProjects={workProjects}
      />
      <SavingsGoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} goal={editingGoal} />
    </div>
  );
}
