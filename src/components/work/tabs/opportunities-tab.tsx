"use client";

import { useState } from "react";
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

type Opportunity = Tables<"work_opportunities">;

const KIND_LABELS: Record<string, string> = {
  job: "Job",
  freelance: "Freelance",
  collab: "Collaboration",
  other: "Other",
};

export function OpportunitiesTab({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | undefined>(undefined);

  // The Opportunities tab covers leads/collabs; job applications live in Employment.
  const leads = opportunities.filter((o) => o.kind !== "job");

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(o: Opportunity) {
    setEditing(o);
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

  if (leads.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Nothing in the pipeline"
          description="Log a lead, pitch, or collaboration you're watching."
          action={
            <Button variant="accent" onClick={openNew}>
              Add an opportunity
            </Button>
          }
        />
        <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} opportunity={editing} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {leads.map((o) => (
          <div key={o.id} className="rounded-[18px] border border-line bg-surface p-7 shadow-north-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              {o.status && <Badge variant="default">{o.status}</Badge>}
              <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-faint">
                {KIND_LABELS[o.kind] ?? o.kind}
              </span>
            </div>
            <div className="mb-1 text-[19px] font-bold leading-snug text-ink">{o.title}</div>
            <div className="mb-3.5 text-[13.5px] text-muted">
              {o.organization ?? "No organization"}
              {o.due_date ? ` · ${format(parseISO(o.due_date), "d MMM")}` : ""}
            </div>
            {o.note && <p className="text-[14.5px] leading-relaxed text-muted">{o.note}</p>}
            <RowActions onEdit={() => openEdit(o)} onDelete={() => handleDelete(o.id)} />
          </div>
        ))}
      </div>
      <AddRowButton onClick={openNew}>Add an opportunity</AddRowButton>

      <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} opportunity={editing} />
    </div>
  );
}
