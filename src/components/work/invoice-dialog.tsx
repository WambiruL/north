"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { invoiceSchema, invoiceStatuses, type InvoiceInput } from "@/lib/validation/work";
import { saveInvoice } from "@/server/actions/work";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Invoice = Tables<"invoices">;
type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string };

const NO_CLIENT = "__none__";
const NO_PROJECT = "__none__";

const STATUS_LABELS: Record<(typeof invoiceStatuses)[number], string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

export interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  clients: ClientOption[];
  projects: ProjectOption[];
}

function toDefaults(invoice?: Invoice): InvoiceInput {
  if (invoice) {
    return {
      title: invoice.title,
      clientId: invoice.client_id ?? null,
      workProjectId: invoice.work_project_id ?? null,
      amount: Number(invoice.amount),
      status: invoice.status as InvoiceInput["status"],
      issuedOn: invoice.issued_on,
      dueOn: invoice.due_on ?? undefined,
      paidOn: invoice.paid_on ?? undefined,
      notes: invoice.notes ?? undefined,
    };
  }
  return {
    title: "",
    clientId: null,
    workProjectId: null,
    amount: 0,
    status: "sent",
    issuedOn: new Date().toISOString().slice(0, 10),
    dueOn: undefined,
    paidOn: undefined,
    notes: "",
  };
}

export function InvoiceDialog({ open, onOpenChange, invoice, clients, projects }: InvoiceDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema) as unknown as Resolver<InvoiceInput>,
    values: toDefaults(invoice),
  });

  async function onSubmit(values: InvoiceInput) {
    setSubmitting(true);
    const result = await saveInvoice(values, invoice?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(invoice ? "Invoice updated" : "Invoice added");
    router.refresh();
    onOpenChange(false);
    if (!invoice) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit invoice" : "New invoice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Kestrel — Phase 2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Client</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NO_CLIENT}
                    onValueChange={(v) => field.onChange(v === NO_CLIENT ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CLIENT}>No client</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Project</Label>
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
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="issuedOn">Issued</Label>
              <Input id="issuedOn" type="date" {...register("issuedOn")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueOn">Due</Label>
              <Input id="dueOn" type="date" {...register("dueOn")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register("notes")} placeholder="Optional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : invoice ? "Save changes" : "Add invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
