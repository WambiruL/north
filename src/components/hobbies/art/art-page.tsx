"use client";

import { useState } from "react";
import { Palette, Plus } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HobbyPageHeader } from "@/components/hobbies/shared/hobby-page-header";
import { ArtworkDialog } from "@/components/hobbies/art/artwork-dialog";
import { ArtworkLightbox } from "@/components/hobbies/art/artwork-lightbox";

type Artwork = Tables<"artworks">;

function ArtworkTile({ artwork, onClick }: { artwork: Artwork; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface shadow-north-sm transition-transform hover:-translate-y-0.5">
      <div className="aspect-square w-full bg-surface-2">
        {artwork.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artwork.image_url} alt={artwork.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-faint">
            <Palette className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="p-3 text-left">
        <span className="line-clamp-1 text-[13px] font-bold text-ink">{artwork.title}</span>
      </div>
    </button>
  );
}

export function ArtPage({
  hobbyId,
  hobbyName,
  description,
  artworks,
}: {
  hobbyId: string;
  hobbyName: string;
  description: string | null;
  artworks: Artwork[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Artwork | undefined>(undefined);
  const [active, setActive] = useState<Artwork | null>(null);

  const current = artworks.filter((a) => a.status === "current");
  const ideas = artworks.filter((a) => a.status === "idea");
  const finished = artworks.filter((a) => a.status === "finished");

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-9">
      <HobbyPageHeader
        name={hobbyName}
        description={description}
        action={
          <Button variant="accent" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" /> Add artwork
          </Button>
        }
      />

      {artworks.length === 0 ? (
        <EmptyState
          icon={<Palette className="h-8 w-8" />}
          title="Your gallery is empty."
          description="Add a piece you're working on, or one you've finished."
          action={
            <Button variant="accent" onClick={openNew}>
              Add artwork
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {current.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Current work</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {current.map((a) => (
                  <ArtworkTile key={a.id} artwork={a} onClick={() => setActive(a)} />
                ))}
              </div>
            </div>
          )}

          {ideas.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Ideas</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {ideas.map((a) => (
                  <ArtworkTile key={a.id} artwork={a} onClick={() => setActive(a)} />
                ))}
              </div>
            </div>
          )}

          {finished.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-faint">Gallery</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {finished.map((a) => (
                  <ArtworkTile key={a.id} artwork={a} onClick={() => setActive(a)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ArtworkDialog open={dialogOpen} onOpenChange={setDialogOpen} hobbyId={hobbyId} artwork={editing} />
      <ArtworkLightbox
        artwork={active}
        hobbyId={hobbyId}
        onOpenChange={(open) => !open && setActive(null)}
        onEdit={(a) => {
          setActive(null);
          setEditing(a);
          setDialogOpen(true);
        }}
      />
    </div>
  );
}
