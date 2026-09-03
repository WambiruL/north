"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Footprints, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { RunDialog } from "@/components/hobbies/running/run-dialog";
import { computeRunStats } from "@/services/running";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeRun } from "@/server/actions/running";

type Run = Tables<"runs">;

function formatPace(minutesPerKm: number | null) {
  if (minutesPerKm == null) return "—";
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}

export function RunningPage({
  hobbyId,
  hobbyName,
  description,
  runs,
}: {
  hobbyId: string;
  hobbyName: string;
  description: string | null;
  runs: Run[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = computeRunStats(runs.map((r) => ({ ...r, distance_km: Number(r.distance_km), duration_minutes: Number(r.duration_minutes) })));

  async function handleDelete(run: Run) {
    const ok = await confirm({ title: "Delete this run?", description: "This can't be undone." });
    if (!ok) return;
    await removeRun(hobbyId, run.id);
    toast.success("Removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobbyName}
        description={description}
        action={
          <Button variant="accent" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Log run
          </Button>
        }
      />

      {runs.length === 0 ? (
        <EmptyState
          icon={<Footprints className="h-8 w-8" />}
          title="No runs logged yet."
          description="Log your latest run to get started."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Log run
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-faint">Total distance</div>
              <div className="text-[20px] font-bold text-ink">{stats.totalDistance.toFixed(1)} km</div>
            </div>
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-faint">This month</div>
              <div className="text-[20px] font-bold text-ink">{stats.runsThisMonth} runs</div>
            </div>
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-faint">Longest run</div>
              <div className="text-[20px] font-bold text-ink">{stats.longestRun.toFixed(1)} km</div>
            </div>
            <div className="rounded-[16px] bg-surface-2 px-5 py-4">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-faint">Best pace</div>
              <div className="text-[20px] font-bold text-ink">{formatPace(stats.bestPace)}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Recent runs</h2>
            <div className="flex flex-col gap-2">
              {runs.map((run) => (
                <div key={run.id} className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-[14px] border border-line bg-surface px-4 py-3.5">
                  <span className="w-[90px] shrink-0 text-[12.5px] font-bold text-muted">
                    {format(parseISO(run.occurred_on), "d MMM")}
                  </span>
                  <span className="text-[14.5px] font-bold text-ink">{Number(run.distance_km).toFixed(1)} km</span>
                  <span className="text-[13px] text-muted">{Number(run.duration_minutes).toFixed(0)} min</span>
                  {run.route && <span className="text-[13px] text-muted">{run.route}</span>}
                  {run.feeling && <span className="text-[13px] text-faint">{run.feeling}</span>}
                  <button onClick={() => handleDelete(run)} aria-label="Delete run" className="ml-auto text-faint hover:text-mahogany">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RunDialog open={dialogOpen} onOpenChange={setDialogOpen} hobbyId={hobbyId} />
    </div>
  );
}
