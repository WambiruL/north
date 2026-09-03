"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Compass, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { TravelEntryDialog } from "@/components/hobbies/travel/travel-entry-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeTravelEntry } from "@/server/actions/travel";

type TravelEntry = Tables<"travel_entries">;

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: TravelEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cover = entry.image_urls[0];
  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-north-sm">
      <div className="aspect-[4/3] w-full bg-surface-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={entry.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-faint">
            <MapPin className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[15px] font-bold text-ink">{entry.title}</span>
        {entry.occurred_on && (
          <span className="text-[11.5px] text-faint">{format(parseISO(entry.occurred_on), "MMMM yyyy")}</span>
        )}
        {entry.reason && <p className="text-[12.5px] text-muted">{entry.reason}</p>}
        {entry.notes && <p className="line-clamp-2 text-[12.5px] text-muted">{entry.notes}</p>}
        <div className="mt-1 flex gap-3">
          <button onClick={onEdit} className="text-[11.5px] font-bold text-faint hover:text-teal">
            <Pencil className="mr-1 inline h-3 w-3" /> Edit
          </button>
          <button onClick={onDelete} className="text-[11.5px] font-bold text-faint hover:text-mahogany">
            <Trash2 className="mr-1 inline h-3 w-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function TravelPage({
  hobbyId,
  hobbyName,
  description,
  entries,
}: {
  hobbyId: string;
  hobbyName: string;
  description: string | null;
  entries: TravelEntry[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TravelEntry | undefined>(undefined);

  const been = entries.filter((e) => e.status === "been");
  const wantToGo = entries.filter((e) => e.status === "want_to_go");

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(entry: TravelEntry) {
    setEditing(entry);
    setDialogOpen(true);
  }

  async function handleDelete(entry: TravelEntry) {
    const ok = await confirm({ title: `Delete "${entry.title}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeTravelEntry(hobbyId, entry.id);
    toast.success("Removed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobbyName}
        description={description}
        action={
          <Button variant="accent" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" /> Add place
          </Button>
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-8 w-8" />}
          title="No places yet."
          description="Add somewhere you've been, or somewhere you want to go."
          action={
            <Button variant="accent" onClick={openNew}>
              Add place
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {been.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Places I&apos;ve been</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {been.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onEdit={() => openEdit(entry)} onDelete={() => handleDelete(entry)} />
                ))}
              </div>
            </div>
          )}

          {wantToGo.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Places I want to go</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wantToGo.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onEdit={() => openEdit(entry)} onDelete={() => handleDelete(entry)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TravelEntryDialog open={dialogOpen} onOpenChange={setDialogOpen} hobbyId={hobbyId} entry={editing} />
    </div>
  );
}
