"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removeArtwork } from "@/server/actions/art";

type Artwork = Tables<"artworks">;

const STATUS_LABEL: Record<string, string> = { current: "In progress", finished: "Finished", idea: "Idea" };

export function ArtworkLightbox({
  artwork,
  hobbyId,
  onOpenChange,
  onEdit,
}: {
  artwork: Artwork | null;
  hobbyId: string;
  onOpenChange: (open: boolean) => void;
  onEdit: (artwork: Artwork) => void;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  if (!artwork) return null;

  async function handleDelete() {
    if (!artwork) return;
    const ok = await confirm({ title: `Delete "${artwork.title}"?`, description: "This can't be undone." });
    if (!ok) return;
    await removeArtwork(hobbyId, artwork.id);
    toast.success("Removed");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={!!artwork} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="max-h-[85vh] overflow-y-auto">
          {artwork.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artwork.image_url} alt={artwork.title} className="max-h-[60vh] w-full bg-ink object-contain" />
          )}
          <div className="flex flex-col gap-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[18px] font-bold text-ink">{artwork.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                  <Badge variant={artwork.status === "finished" ? "teal" : "default"}>
                    {STATUS_LABEL[artwork.status] ?? artwork.status}
                  </Badge>
                  {artwork.medium && <span>{artwork.medium}</span>}
                  {artwork.dimensions && <span>{artwork.dimensions}</span>}
                  <span>{format(parseISO(artwork.occurred_on), "d MMM yyyy")}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => onEdit(artwork)} aria-label="Edit" className="rounded-full p-1.5 text-faint hover:text-teal">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={handleDelete} aria-label="Delete" className="rounded-full p-1.5 text-faint hover:text-mahogany">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {artwork.notes && <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{artwork.notes}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
