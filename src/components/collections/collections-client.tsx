"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tables } from "@/types/database.types";
import type { MarkProps } from "@/components/ui/mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mark } from "@/components/ui/mark";
import { EmptyState } from "@/components/ui/empty-state";
import { CollectionDialog } from "@/components/collections/collection-dialog";

type Collection = Tables<"collections"> & { itemCount: number; doneCount: number };

export function CollectionsClient({
  collections,
  autoOpen,
}: {
  collections: Collection[];
  autoOpen: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(autoOpen);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Collections</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            Curated lists worth keeping — reading, ideas, places to go.
          </p>
        </div>
        <Button variant="accent" onClick={() => setDialogOpen(true)}>
          New collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          description="Start a reading list, a gift-ideas board, or a bucket list of restaurants."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Start a collection
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const progress =
              collection.itemCount > 0
                ? Math.round((collection.doneCount / collection.itemCount) * 100)
                : 0;
            return (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="flex h-full flex-col gap-3 p-5 transition-colors hover:bg-surface-2">
                  <div className="flex items-center gap-2.5">
                    <Mark shape={collection.icon_mark as MarkProps["shape"]} tone="teal" size={10} />
                    <h3 className="text-[15px] font-bold text-ink">{collection.name}</h3>
                  </div>
                  {collection.description && (
                    <p className="text-[13px] leading-relaxed text-muted">
                      {collection.description}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col gap-1.5 pt-2">
                    <div className="flex items-center justify-between text-[12px] text-faint">
                      <span>
                        {collection.doneCount} / {collection.itemCount} done
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <CollectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
