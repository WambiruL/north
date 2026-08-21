"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mark } from "@/components/ui/mark";

const SHORTCUTS: { label: string; href: string; tone: "amber" | "teal" | "mahogany" | "muted" }[] = [
  { label: "New check-in", href: "/check-ins?new=check_in", tone: "amber" },
  { label: "New note", href: "/notes?new=note", tone: "muted" },
  { label: "New task", href: "/work?new=task", tone: "teal" },
  { label: "New project", href: "/work?new=project", tone: "teal" },
  { label: "New expense", href: "/finances?new=transaction", tone: "teal" },
  { label: "New idea", href: "/creative-studio?new=idea", tone: "mahogany" },
  { label: "New collection", href: "/collections?new=collection", tone: "muted" },
  { label: "New goal", href: "/dream-life?new=dream_goal", tone: "mahogany" },
];

export function QuickCreate() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant="accent" size="icon" onClick={() => setOpen(true)} aria-label="Quick create">
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quick create</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            {SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.href}
                onClick={() => {
                  setOpen(false);
                  router.push(shortcut.href);
                }}
                className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] font-semibold text-ink transition-colors hover:bg-surface-2"
              >
                <Mark tone={shortcut.tone} size={7} />
                {shortcut.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
