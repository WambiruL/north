"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { getHobbyTemplate } from "@/lib/constants/hobby-templates";
import type { HobbyPreview } from "@/services/hobby-previews";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HobbyDialog } from "@/components/hobbies/hobby-dialog";
import { HobbyMark } from "@/components/hobbies/hobby-mark";
import { HobbyKindGrid } from "@/components/hobbies/hobby-kind-picker";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeHobby } from "@/server/actions/hobbies";
import { useRouter } from "next/navigation";

type Hobby = Tables<"hobbies">;

const EMPTY_PROMPTS: Record<string, string> = {
  reading: "What are you reading, or want to read?",
  photography: "What have you been photographing?",
  cooking: "What have you been cooking?",
  visual_art: "What are you making?",
  travel: "Where have you been, or want to go?",
  running: "Log your latest run.",
};

function emptyPromptFor(kind: string) {
  return EMPTY_PROMPTS[kind] ?? `Add your first ${getHobbyTemplate(kind).entryVerb.toLowerCase()}.`;
}

function PreviewBody({ preview, kind }: { preview: HobbyPreview; kind: string }) {
  if (preview.kind === "empty") {
    return <p className="text-[13px] text-muted">{emptyPromptFor(kind)}</p>;
  }
  if (preview.kind === "photos") {
    return (
      <div className="flex gap-1.5">
        {preview.images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img} alt="" className="h-14 w-14 rounded-[10px] object-cover" />
        ))}
      </div>
    );
  }
  if (preview.kind === "book") {
    return (
      <div className="flex items-center gap-3">
        {preview.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.coverUrl} alt="" className="h-16 w-11 shrink-0 rounded-[4px] object-cover shadow-north-sm" />
        ) : (
          <span className="flex h-16 w-11 shrink-0 items-center justify-center rounded-[4px] bg-surface-2 text-faint">
            <Sparkles className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-faint">{preview.label}</div>
          <div className="line-clamp-1 text-[14.5px] font-bold text-ink">{preview.title}</div>
          {preview.author && <div className="line-clamp-1 text-[12px] text-muted">{preview.author}</div>}
        </div>
      </div>
    );
  }
  if (preview.kind === "dish" || preview.kind === "art" || preview.kind === "travel") {
    const image = preview.kind === "dish" ? preview.photoUrl : preview.imageUrl;
    return (
      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-[10px] object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-faint">
            <Sparkles className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-faint">{preview.label}</div>
          <div className="line-clamp-1 text-[14.5px] font-bold text-ink">
            {preview.kind === "dish" ? preview.name : preview.title}
          </div>
        </div>
      </div>
    );
  }
  if (preview.kind === "run") {
    return (
      <div className="text-[14.5px] font-bold text-ink">
        {preview.distanceKm.toFixed(1)} km <span className="font-normal text-muted">· {preview.durationMinutes.toFixed(0)} min</span>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-faint">{preview.label}</div>
      <div className="line-clamp-1 text-[14.5px] font-bold text-ink">{preview.title}</div>
      {preview.sub && <div className="line-clamp-1 text-[12px] text-muted">{preview.sub}</div>}
    </div>
  );
}

export function HobbiesClient({
  hobbies,
  previews,
}: {
  hobbies: Hobby[];
  previews: Record<string, HobbyPreview>;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedKind, setPickedKind] = useState<string | undefined>(undefined);
  const [editingHobby, setEditingHobby] = useState<Hobby | undefined>(undefined);

  function startAddHobby() {
    if (hobbies.length === 0) {
      setPickedKind(undefined);
      setEditingHobby(undefined);
      setDialogOpen(true);
    } else {
      setPickerOpen(true);
    }
  }

  function pickKind(kind: string) {
    setPickedKind(kind);
    setEditingHobby(undefined);
    setPickerOpen(false);
    setDialogOpen(true);
  }

  function openEdit(e: React.MouseEvent, hobby: Hobby) {
    e.preventDefault();
    e.stopPropagation();
    setEditingHobby(hobby);
    setPickedKind(undefined);
    setDialogOpen(true);
  }

  async function handleQuickDelete(e: React.MouseEvent, id: string, name: string) {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({ title: `Delete "${name}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeHobby(id);
    toast.success("Hobby deleted");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Things I make time for.</h1>
          <p className="mt-1 max-w-[38em] text-[15px] text-muted">Nothing here needs keeping up with.</p>
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
            Pick a few things that feel like you. North gives each one the kind of space it actually needs.
          </p>
          <HobbyKindGrid onPick={pickKind} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {hobbies.map((hobby) => {
            const template = getHobbyTemplate(hobby.kind);
            const preview = previews[hobby.id] ?? { kind: "empty" as const };
            return (
              <Link
                key={hobby.id}
                href={`/hobbies/${hobby.id}`}
                className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-6 shadow-north-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-north-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <HobbyMark id={hobby.id} name={hobby.name} />
                    <div className="min-w-0">
                      <div className="truncate text-[17px] font-extrabold tracking-tight text-ink">{hobby.name}</div>
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-faint">
                        {template.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={(e) => openEdit(e, hobby)}
                      aria-label="Edit hobby"
                      className="rounded-full p-1.5 text-faint transition-colors hover:text-teal"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleQuickDelete(e, hobby.id, hobby.name)}
                      aria-label="Delete hobby"
                      className="rounded-full p-1.5 text-faint transition-colors hover:text-mahogany"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <PreviewBody preview={preview} kind={hobby.kind} />
              </Link>
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

      <HobbyDialog open={dialogOpen} onOpenChange={setDialogOpen} initialKind={pickedKind} hobby={editingHobby} />
    </div>
  );
}
