"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Users } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddRowButton } from "@/components/work/shared";
import { formatCurrency } from "@/lib/currency";
import { ClientDialog } from "@/components/work/client-dialog";
import { InvoiceDialog } from "@/components/work/invoice-dialog";
import { removeClient, removeInvoice } from "@/server/actions/work";

type ClientRow = Tables<"clients">;
type Invoice = Tables<"invoices"> & {
  client: { id: string; name: string } | null;
  work_project: { id: string; name: string } | null;
};
type ProjectOption = { id: string; name: string };
type Activity = Tables<"activities">;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function FreelanceTab({
  clients,
  invoices,
  projects,
  recentActivity,
  currency,
}: {
  clients: ClientRow[];
  invoices: Invoice[];
  projects: ProjectOption[];
  recentActivity: Activity[];
  currency: string;
}) {
  const router = useRouter();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | undefined>(undefined);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);

  const outstandingByClient = new Map<string, number>();
  for (const invoice of invoices) {
    if (invoice.status === "paid" || !invoice.client_id) continue;
    outstandingByClient.set(
      invoice.client_id,
      (outstandingByClient.get(invoice.client_id) ?? 0) + Number(invoice.amount),
    );
  }

  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const outstandingTotal = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  function openEditClient(client: ClientRow) {
    setEditingClient(client);
    setClientDialogOpen(true);
  }

  async function handleDeleteClient(id: string) {
    await removeClient(id);
    toast.success("Client removed");
    router.refresh();
  }

  function openEditInvoice(invoice: Invoice) {
    setEditingInvoice(invoice);
    setInvoiceDialogOpen(true);
  }

  async function handleDeleteInvoice(id: string) {
    await removeInvoice(id);
    toast.success("Invoice removed");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[18px] border border-line bg-surface p-7 shadow-north-sm">
        <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
          Clients
        </div>
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No clients yet"
            description="Add a client to start tracking freelance work and invoices."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {clients.map((client) => {
              const outstanding = outstandingByClient.get(client.id) ?? 0;
              return (
                <div
                  key={client.id}
                  className="flex items-start gap-4 border-b border-line-2 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[13px] font-bold text-ink">
                    {initials(client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[16.5px] font-bold text-ink">{client.name}</span>
                      {outstanding > 0 && <Badge variant="amber">Owes {formatCurrency(outstanding, currency)}</Badge>}
                    </div>
                    {client.notes && <div className="mt-0.5 text-[13.5px] text-muted">{client.notes}</div>}
                    <div className="mt-3 flex gap-3.5">
                      <button
                        className="text-[12px] font-bold text-faint hover:text-teal"
                        onClick={() => openEditClient(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[12px] font-bold text-faint hover:text-mahogany"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <AddRowButton onClick={() => { setEditingClient(undefined); setClientDialogOpen(true); }}>
          Add a client
        </AddRowButton>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Money in
          </div>
          <div className="flex flex-col gap-2.5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-muted">Paid</span>
              <span className="font-bold text-ink">{formatCurrency(paidTotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Outstanding</span>
              <span className="font-bold text-amber">{formatCurrency(outstandingTotal, currency)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Invoices
          </div>
          {invoices.length === 0 ? (
            <p className="text-[13.5px] text-muted">No invoices yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {invoices.slice(0, 6).map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-3">
                  <span
                    className={
                      "h-2 w-2 shrink-0 rounded-full " +
                      (invoice.status === "paid"
                        ? "bg-teal"
                        : invoice.status === "overdue"
                          ? "bg-mahogany"
                          : "bg-amber")
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-ink">{invoice.title}</div>
                    <div className="text-[12px] text-faint">
                      {invoice.client?.name ?? "No client"} ·{" "}
                      {invoice.status === "paid" && invoice.paid_on
                        ? `paid ${format(parseISO(invoice.paid_on), "d MMM")}`
                        : invoice.status}
                    </div>
                    <div className="mt-2 flex gap-3.5">
                      <button
                        className="text-[12px] font-bold text-faint hover:text-teal"
                        onClick={() => openEditInvoice(invoice)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[12px] font-bold text-faint hover:text-mahogany"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className="text-[14.5px] font-bold text-ink">{formatCurrency(Number(invoice.amount), currency)}</span>
                </div>
              ))}
            </div>
          )}
          <AddRowButton onClick={() => { setEditingInvoice(undefined); setInvoiceDialogOpen(true); }}>
            Add an invoice
          </AddRowButton>
        </div>

        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Recent activity
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-[13.5px] text-muted">Nothing logged yet.</p>
          ) : (
            <div className="relative flex flex-col gap-6 pl-6">
              <div className="absolute bottom-1.5 left-[3px] top-1.5 w-px bg-line" />
              {recentActivity.map((entry) => (
                <div key={entry.id} className="relative">
                  <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-teal" />
                  <div className="text-[12.5px] font-bold text-muted">
                    {format(parseISO(entry.occurred_at), "d MMMM")}
                  </div>
                  <div className="text-[14.5px] text-ink">
                    {entry.verb} {entry.summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} client={editingClient} />
      <InvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        invoice={editingInvoice}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        projects={projects}
      />
    </div>
  );
}
