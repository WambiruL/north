"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { transactionSchema, type TransactionInput } from "@/lib/validation/finances";
import { saveTransaction } from "@/server/actions/finances";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Transaction = Tables<"transactions">;
type AccountOption = { id: string; name: string };
type ProjectOption = { id: string; name: string };

const NO_PROJECT = "__none__";

export interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  accounts: AccountOption[];
  workProjects: ProjectOption[];
}

function toDefaults(transaction?: Transaction, defaultAccountId?: string): TransactionInput {
  if (transaction) {
    return {
      accountId: transaction.account_id,
      workProjectId: transaction.work_project_id ?? null,
      description: transaction.description,
      category: transaction.category,
      amount: Number(transaction.amount),
      occurredOn: transaction.occurred_on,
    };
  }
  return {
    accountId: defaultAccountId ?? "",
    workProjectId: null,
    description: "",
    category: "general",
    amount: 0,
    occurredOn: new Date().toISOString().slice(0, 10),
  };
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  accounts,
  workProjects,
}: TransactionDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as unknown as Resolver<TransactionInput>,
    values: toDefaults(transaction, accounts[0]?.id),
  });

  async function onSubmit(values: TransactionInput) {
    setSubmitting(true);
    const result = await saveTransaction(values, transaction?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(transaction ? "Transaction updated" : "Transaction logged");
    router.refresh();
    onOpenChange(false);
    if (!transaction) reset(toDefaults(undefined, accounts[0]?.id));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit transaction" : "New transaction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="Coffee, invoice, rent…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Account</Label>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder="-24.50 or 1200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} placeholder="general" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register("occurredOn")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Work project (optional)</Label>
            <Controller
              control={control}
              name="workProjectId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NO_PROJECT}
                  onValueChange={(v) => field.onChange(v === NO_PROJECT ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROJECT}>No project</SelectItem>
                    {workProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : transaction ? "Save changes" : "Log transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
