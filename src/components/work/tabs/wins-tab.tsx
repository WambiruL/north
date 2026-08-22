"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Trophy } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/work/shared";
import { WinDialog } from "@/components/work/win-dialog";
import { removeWin } from "@/server/actions/work";

type Win = Tables<"work_wins">;

export function WinsTab({ wins }: { wins: Win[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Win | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(win: Win) {
    setEditing(win);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await removeWin(id);
    toast.success("Removed");
    router.refresh();
  }

  if (wins.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="No wins logged yet"
          description="The small ones count too — write down what went right."
          action={
            <Button variant="accent" onClick={openNew}>
              Log a win
            </Button>
          }
        />
        <WinDialog open={dialogOpen} onOpenChange={setDialogOpen} win={editing} />
      </>
    );
  }

  return (
    <div className="max-w-3xl rounded-[18px] border border-line bg-surface p-9 shadow-north-sm">
      <div className="mb-7 text-[11px] font-extrabold uppercase tracking-widest text-faint">
        Things that went right
      </div>
      <div className="relative flex flex-col gap-7 pl-7">
        <div className="absolute bottom-1.5 left-[5px] top-1.5 w-px bg-line" />
        {wins.map((win) => (
          <div key={win.id} className="relative">
            <span className="absolute -left-7 top-1.5 h-2.5 w-2.5 rounded-full bg-amber" />
            <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
              <span className="text-[12.5px] font-extrabold uppercase tracking-wider text-amber">
                {format(parseISO(win.occurred_on), "d MMMM")}
              </span>
              {win.kind && (
                <span className="rounded-full bg-teal-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal">
                  {win.kind}
                </span>
              )}
            </div>
            <div className="mb-1.5 text-[20px] font-bold text-ink">{win.title}</div>
            {win.note && (
              <p className="max-w-[42em] text-[15px] leading-relaxed text-muted">{win.note}</p>
            )}
            <RowActions onEdit={() => openEdit(win)} onDelete={() => handleDelete(win.id)} />
          </div>
        ))}
      </div>
      <AddRowButton onClick={openNew} className="mt-7">
        Log a win
      </AddRowButton>

      <WinDialog open={dialogOpen} onOpenChange={setDialogOpen} win={editing} />
    </div>
  );
}
