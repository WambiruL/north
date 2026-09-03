"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { removePhoto, toggleFavoritePhoto } from "@/server/actions/photography";
import { cn } from "@/lib/utils";

type Photo = Tables<"photos">;

export function PhotoLightbox({
  photo,
  hobbyId,
  onOpenChange,
}: {
  photo: Photo | null;
  hobbyId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  if (!photo) return null;

  async function handleDelete() {
    if (!photo) return;
    const ok = await confirm({ title: "Delete this photo?", description: "This can't be undone." });
    if (!ok) return;
    await removePhoto(hobbyId, photo.id);
    toast.success("Photo removed");
    onOpenChange(false);
    router.refresh();
  }

  async function handleToggleFavorite() {
    if (!photo) return;
    await toggleFavoritePhoto(hobbyId, photo.id, !photo.is_favorite);
    router.refresh();
  }

  return (
    <Dialog open={!!photo} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="max-h-[85vh] overflow-y-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.image_url} alt={photo.caption ?? ""} className="max-h-[60vh] w-full object-contain bg-ink" />
          <div className="flex flex-col gap-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {photo.caption && <p className="text-[16px] font-bold text-ink">{photo.caption}</p>}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-muted">
                  <span>{format(parseISO(photo.occurred_on), "d MMMM yyyy")}</span>
                  {photo.location && <span>{photo.location}</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={handleToggleFavorite}
                  aria-label="Toggle favorite"
                  className="rounded-full p-1.5 text-faint transition-colors hover:text-mahogany"
                >
                  <Heart className={cn("h-4 w-4", photo.is_favorite && "fill-mahogany text-mahogany")} />
                </button>
                <button
                  onClick={handleDelete}
                  aria-label="Delete photo"
                  className="rounded-full p-1.5 text-faint transition-colors hover:text-mahogany"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
