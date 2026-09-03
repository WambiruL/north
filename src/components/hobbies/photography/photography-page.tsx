"use client";

import { useMemo, useState } from "react";
import { Camera, Heart, Plus } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { PhotoDialog } from "@/components/hobbies/photography/photo-dialog";
import { SeriesDialog } from "@/components/hobbies/photography/series-dialog";
import { PhotoLightbox } from "@/components/hobbies/photography/photo-lightbox";
import { cn } from "@/lib/utils";

type Photo = Tables<"photos">;
type PhotoSeries = Tables<"photo_series">;

function PhotoTile({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded-[12px] bg-surface-2"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.image_url} alt={photo.caption ?? ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      {photo.is_favorite && (
        <Heart className="absolute right-2 top-2 h-4 w-4 fill-white text-white drop-shadow" />
      )}
    </button>
  );
}

export function PhotographyPage({
  hobbyId,
  hobbyName,
  description,
  photos,
  series,
}: {
  hobbyId: string;
  hobbyName: string;
  description: string | null;
  photos: Photo[];
  series: PhotoSeries[];
}) {
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const favorites = photos.filter((p) => p.is_favorite);
  const photosBySeries = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos) {
      if (!p.series_id) continue;
      map.set(p.series_id, [...(map.get(p.series_id) ?? []), p]);
    }
    return map;
  }, [photos]);

  const filters = [
    { value: "all", label: "All" },
    ...(favorites.length > 0 ? [{ value: "favorites", label: "Favorites" }] : []),
    ...series.map((s) => ({ value: s.id, label: s.title })),
  ];

  const visible =
    filter === "all" ? photos : filter === "favorites" ? favorites : photosBySeries.get(filter) ?? [];

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobbyName}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setSeriesDialogOpen(true)}>
              Create series
            </Button>
            <Button variant="accent" onClick={() => setPhotoDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add photo
            </Button>
          </div>
        }
      />

      {photos.length === 0 ? (
        <EmptyState
          icon={<Camera className="h-8 w-8" />}
          title="No photographs yet."
          description="Add one you love."
          action={
            <Button variant="accent" onClick={() => setPhotoDialogOpen(true)}>
              Add photo
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {filters.length > 1 && (
            <div className="flex flex-wrap gap-1 rounded-[10px] bg-surface-2 p-1">
              {filters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-[7px] px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                    filter === f.value ? "bg-raise text-ink shadow-north-sm" : "text-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {visible.map((photo) => (
              <PhotoTile key={photo.id} photo={photo} onClick={() => setActivePhoto(photo)} />
            ))}
          </div>
        </div>
      )}

      <PhotoDialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen} hobbyId={hobbyId} series={series} />
      <SeriesDialog open={seriesDialogOpen} onOpenChange={setSeriesDialogOpen} hobbyId={hobbyId} />
      <PhotoLightbox photo={activePhoto} hobbyId={hobbyId} onOpenChange={(open) => !open && setActivePhoto(null)} />
    </div>
  );
}
