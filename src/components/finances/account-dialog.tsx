"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { accountSchema, accountKinds, type AccountInput } from "@/lib/validation/finances";
import { saveAccount } from "@/server/actions/finances";
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

type Account = Tables<"financial_accounts">;

const KIND_LABELS: Record<(typeof accountKinds)[number], string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit",
  cash: "Cash",
  investment: "Investment",
};

export interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}

function toDefaults(account?: Account): AccountInput {
  if (account) {
    return {
      name: account.name,
      kind: account.kind as AccountInput["kind"],
      currency: account.currency,
      balance: Number(account.balance),
    };
  }
  return { name: "", kind: "checking", currency: "USD", balance: 0 };
}

export function AccountDialog({ open, onOpenChange, account }: AccountDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema) as unknown as Resolver<AccountInput>,
    values: toDefaults(account),
  });

  async function onSubmit(values: AccountInput) {
    setSubmitting(true);
    const result = await saveAccount(values, account?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(account ? "Account updated" : "Account added");
    router.refresh();
    onOpenChange(false);
    if (!account) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "New account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Everyday checking" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Kind</Label>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountKinds.map((k) => (
                        <SelectItem key={k} value={k}>
                          {KIND_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} placeholder="USD" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="balance">
              {account ? "Balance" : "Starting balance"}
            </Label>
            <Input id="balance" type="number" step="0.01" {...register("balance")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : account ? "Save changes" : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
