"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddRowButton, usd } from "@/components/work/shared";
import { OpportunityDialog } from "@/components/work/opportunity-dialog";
import { removeOpportunity } from "@/server/actions/work";

type Opportunity = Tables<"work_opportunities">;
type IncomeSource = Tables<"income_sources">;

export function EmploymentTab({
  applications,
  currentEmployment,
}: {
  applications: Opportunity[];
  currentEmployment: IncomeSource | null;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | undefined>(undefined);

  const nextInterview = applications
    .filter((a) => a.status === "interview" && a.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(app: Opportunity) {
    setEditing(app);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeOpportunity(id);
    toast.success("Removed");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[18px] border border-line bg-surface p-7 shadow-north-sm">
        <div className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
          Applications
        </div>
        {applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-8 w-8" />}
            title="No applications yet"
            description="Log a role you've applied for to track where it stands."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-start gap-3.5 border-b border-line-2 pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-bold text-ink">{app.title}</div>
                  {app.organization && <div className="text-[13px] text-muted">{app.organization}</div>}
                  <div className="mt-3 flex gap-3.5">
                    <button
                      className="text-[12px] font-bold text-faint hover:text-teal"
                      onClick={() => openEdit(app)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-[12px] font-bold text-faint hover:text-mahogany"
                      onClick={() => handleDelete(app.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {app.status && <Badge variant="default">{app.status}</Badge>}
              </div>
            ))}
          </div>
        )}
        <AddRowButton onClick={openNew}>Add an application</AddRowButton>
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
                <span className="text-muted">{currentEmployment.frequency === "monthly" ? "Monthly" : currentEmployment.frequency}</span>
                <span className="font-bold text-ink">{usd.format(Number(currentEmployment.amount))}</span>
              </div>
            </>
          ) : (
            <p className="text-[13.5px] text-muted">
              Add a salary income source in Finances to see it here.
            </p>
          )}
        </div>
      </div>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={editing}
        lockedKind="job"
      />
    </div>
  );
}
