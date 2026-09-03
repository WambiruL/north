"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/work/shared";
import { OpportunityDialog } from "@/components/work/opportunity-dialog";
import { removeOpportunity } from "@/server/actions/work";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Opportunity = Tables<"work_opportunities">;
type IncomeSource = Tables<"income_sources">;

const KIND_LABELS: Record<string, string> = {
  job: "Job",
  freelance: "Freelance",
  collab: "Collaboration",
  other: "Other",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "job", label: "Applications" },
  { value: "freelance", label: "Freelance" },
  { value: "collab", label: "Collabs" },
  { value: "other", label: "Other" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export function OpportunitiesTab({
  opportunities,
  currentEmployment,
  currency,
}: {
  opportunities: Opportunity[];
  currentEmployment: IncomeSource | null;
  currency: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | undefined>(undefined);
  const [lockedKind, setLockedKind] = useState<"job" | undefined>(undefined);

  const filtered = useMemo(
    () => (filter === "all" ? opportunities : opportunities.filter((o) => o.kind === filter)),
    [opportunities, filter],
  );

  const nextInterview = opportunities
    .filter((o) => o.kind === "job" && o.status === "interview" && o.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];

  function openNew() {
    setEditing(undefined);
    setLockedKind(filter === "job" ? "job" : undefined);
    setDialogOpen(true);
  }

  function openEdit(o: Opportunity) {
    setEditing(o);
    setLockedKind(undefined);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const opportunity = opportunities.find((o) => o.id === id);
    const ok = await confirm({
      title: `Delete "${opportunity?.title ?? "this opportunity"}"?`,
      description: "This can't be undone.",
    });
    if (!ok) return;
    await removeOpportunity(id);
    toast.success("Removed");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[18px] border border-line bg-surface p-7 shadow-north-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-faint">Pipeline</div>
          <div className="flex flex-wrap gap-1 rounded-[10px] bg-surface-2 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-[7px] px-2.5 py-1 text-[12px] font-bold transition-colors",
                  filter === f.value ? "bg-raise text-ink shadow-north-sm" : "text-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="Nothing here yet"
            description="Log a lead, application, or collaboration you're watching."
            action={
              <Button variant="accent" onClick={openNew}>
                Add an opportunity
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((o) => (
              <div key={o.id} className="rounded-[16px] border border-line-2 bg-raise p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  {o.status && <Badge variant="default">{o.status}</Badge>}
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">
                    {KIND_LABELS[o.kind] ?? o.kind}
                  </span>
                </div>
                <div className="mb-1 text-[17px] font-bold leading-snug text-ink">{o.title}</div>
                <div className="mb-3 text-[13px] text-muted">
                  {o.organization ?? "No organization"}
                  {o.due_date ? ` · ${format(parseISO(o.due_date), "d MMM")}` : ""}
                </div>
                {o.note && <p className="text-[13.5px] leading-relaxed text-muted">{o.note}</p>}
                <RowActions onEdit={() => openEdit(o)} onDelete={() => handleDelete(o.id)} />
              </div>
            ))}
          </div>
        )}
        <AddRowButton onClick={openNew}>Add an opportunity</AddRowButton>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Next interview
          </div>
          {nextInterview ? (
            <>
              <div className="mb-1.5 text-[20px] font-bold text-ink">{nextInterview.title}</div>
              <div className="mb-4 text-[14px] text-muted">
                {format(parseISO(nextInterview.due_date!), "EEEE d MMMM")}
                {nextInterview.organization ? ` · ${nextInterview.organization}` : ""}
              </div>
              {nextInterview.note && (
                <div className="rounded-[14px] bg-surface-2 p-4 text-[14px] leading-relaxed text-muted">
                  {nextInterview.note}
                </div>
              )}
            </>
          ) : (
            <p className="text-[13.5px] text-muted">Nothing on the calendar yet.</p>
          )}
        </div>

        <div className="rounded-[18px] border border-line bg-surface p-6 shadow-north-sm">
          <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
            Current employment
          </div>
          {currentEmployment ? (
            <>
              <div className="mb-1 text-[18px] font-bold text-ink">{currentEmployment.name}</div>
              {currentEmployment.last_received_on && (
                <div className="mb-4 text-[14px] text-muted">
                  Last paid {format(parseISO(currentEmployment.last_received_on), "d MMMM yyyy")}
                </div>
              )}
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">
                  {currentEmployment.frequency === "monthly" ? "Monthly" : currentEmployment.frequency}
                </span>
                <span className="font-bold text-ink">
                  {formatCurrency(Number(currentEmployment.amount), currency)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-[13.5px] text-muted">Add a salary income source in Finances to see it here.</p>
          )}
        </div>
      </div>

      <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} opportunity={editing} lockedKind={lockedKind} />
    </div>
  );
}
