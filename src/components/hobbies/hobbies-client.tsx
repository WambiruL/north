"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Trash2, Pencil } from "lucide-react";
import type { Tables } from "@/types/database.types";
import type { HobbyDetail } from "@/services/hobbies";
import { computeTemplateFacts, computeCurrentActivity } from "@/services/hobbies";
import { getHobbyTemplate } from "@/lib/constants/hobby-templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HobbyDialog } from "@/components/hobbies/hobby-dialog";
import { HobbySheet } from "@/components/hobbies/hobby-sheet";
import { HobbyMark } from "@/components/hobbies/hobby-mark";
import { HobbyKindGrid } from "@/components/hobbies/hobby-kind-picker";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeHobby } from "@/server/actions/hobbies";

type Hobby = Tables<"hobbies"> & {
  projectCount: number;
  memoryCount: number;
  stats: HobbyDetail["stats"];
};

export function HobbiesClient({
  hobbies,
  detailById,
  initialOpenId,
}: {
  hobbies: Hobby[];
  detailById: Record<string, HobbyDetail>;
  initialOpenId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedKind, setPickedKind] = useState<string | undefined>(undefined);
  const [openHobbyId, setOpenHobbyId] = useState<string | undefined>(
    initialOpenId && detailById[initialOpenId] ? initialOpenId : undefined,
  );

  function openHobby(id: string) {
    setOpenHobbyId(id);
    router.replace(`${pathname}?hobby=${id}`, { scroll: false });
  }

  function closeHobby(open: boolean) {
    if (!open) {
      setOpenHobbyId(undefined);
      router.replace(pathname, { scroll: false });
    }
  }

  function startAddHobby() {
    if (hobbies.length === 0) {
      setPickedKind(undefined);
      setDialogOpen(true);
    } else {
      setPickerOpen(true);
    }
  }

  function pickKind(kind: string) {
    setPickedKind(kind);
    setPickerOpen(false);
    setDialogOpen(true);
  }

  async function handleQuickDelete(id: string, name: string) {
    const ok = await confirm({ title: `Delete "${name}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeHobby(id);
    toast.success("Hobby deleted");
    router.refresh();
  }

  const openDetail = openHobbyId ? detailById[openHobbyId] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Things I make time for.</h1>
          <p className="mt-1 max-w-[38em] text-[15px] text-muted">
            Nothing here needs keeping up with.
          </p>
        </div>
        {hobbies.length > 0 && (
          <Button variant="accent" onClick={startAddHobby}>
            Add a hobby
          </Button>
        )}
      </div>

      {hobbies.length === 0 ? (
        <div className="max-w-[900px]">
          <p className="mb-6 max-w-[38em] text-[15.5px] leading-relaxed text-muted">
            Pick a few things that feel like you. North gives each one the kind of space it actually
            needs.
          </p>
          <HobbyKindGrid onPick={pickKind} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {hobbies.map((hobby) => {
            const template = getHobbyTemplate(hobby.kind);
            const memories = detailById[hobby.id]?.memories ?? [];
            const facts = computeTemplateFacts(template, memories);
            const current = computeCurrentActivity(template, memories);
            return (
              <div
                key={hobby.id}
                className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-north-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-north-md"
              >
                <button onClick={() => openHobby(hobby.id)} className="block w-full text-left">
                  <div className="h-40 w-full bg-surface-2">
                    {hobby.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hobby.cover_url}
                        alt={hobby.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-faint">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-1 pt-5">
                    <div className="mb-3.5 flex items-start gap-3.5">
                      <HobbyMark id={hobby.id} name={hobby.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[19px] font-extrabold tracking-tight text-ink">
                          {hobby.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-extrabold uppercase tracking-[0.13em] text-faint">
                          {template.label}
                        </span>
                      </span>
                    </div>

                    {current ? (
                      <>
                        <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.13em] text-faint">
                          {current.label}
                        </span>
                        <span className="mb-0.5 block truncate text-[16px] font-extrabold leading-[1.35] text-ink">
                          {current.title}
                        </span>
                        {current.sub && (
                          <span className="block truncate text-[13px] text-muted">{current.sub}</span>
                        )}
                      </>
                    ) : (
                      <p className="text-[13.5px] leading-relaxed text-muted">
                        {hobby.description || "Nothing logged yet."}
                      </p>
                    )}
                  </div>
                </button>

                <div className="mt-2 flex items-center gap-6 px-6">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <div className="text-[15px] font-extrabold text-ink">{fact.value}</div>
                      <div className="mt-0.5 text-[11.5px] font-bold text-faint">{fact.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center gap-3.5 px-6 pb-5 pt-4">
                  <button
                    onClick={() => openHobby(hobby.id)}
                    className="text-[13px] font-extrabold text-teal transition-colors hover:text-amber"
                  >
                    Open workspace
                  </button>
                  <span className="flex-1" />
                  <button
                    onClick={() => openHobby(hobby.id)}
                    aria-label="Edit hobby"
                    className="text-faint transition-colors hover:text-teal"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickDelete(hobby.id, hobby.name)}
                    aria-label="Delete hobby"
                    className="text-faint transition-colors hover:text-mahogany"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>What do you enjoy doing?</DialogTitle>
            <DialogDescription>Pick one and North gives it the kind of space it needs.</DialogDescription>
          </DialogHeader>
          <HobbyKindGrid onPick={pickKind} className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2" />
        </DialogContent>
      </Dialog>

      <HobbyDialog open={dialogOpen} onOpenChange={setDialogOpen} initialKind={pickedKind} />
      {openDetail && <HobbySheet detail={openDetail} open={Boolean(openHobbyId)} onOpenChange={closeHobby} />}
    </div>
  );
}
