"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Tables } from "@/types/database.types";
import type { BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { CollectionDialog } from "@/components/collections/collection-dialog";
import { CollectionItemDialog } from "@/components/collections/collection-item-dialog";
import { removeCollection, removeCollectionItem, toggleItemDone } from "@/server/actions/collections";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type Collection = Tables<"collections">;
type CollectionWithProgress = Collection & { itemCount: number; doneCount: number };
type CollectionItem = Tables<"collection_items">;

const PRIORITY_LABEL: Record<string, string> = { low: "Low", medium: "Medium", high: "High" };
const PRIORITY_VARIANT: Record<string, BadgeProps["variant"]> = {
  low: "default",
  medium: "amber",
  high: "mahogany",
};

function ProgressRing({ pct }: { pct: number }) {
  return (
    <span
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(var(--teal) ${pct * 3.6}deg, var(--surface-2) 0deg)` }}
    >
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-surface text-[10px] font-extrabold text-ink">
        {pct}
      </span>
    </span>
  );
}

function ItemRow({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: CollectionItem;
  onToggle: (item: CollectionItem) => void;
  onEdit: (item: CollectionItem) => void;
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[13px] px-2.5 py-3.5 transition-colors hover:bg-surface-2 sm:flex-row sm:items-start sm:gap-3.5">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <Checkbox checked={item.is_done} onChange={() => onToggle(item)} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div
            className={
              item.is_done
                ? "text-[14px] font-semibold text-faint line-through"
                : "text-[14px] font-semibold text-ink"
            }
          >
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </div>
          {item.note && <div className="mt-1 text-[12.5px] text-faint">{item.note}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 pl-9 sm:pl-0 sm:pt-1">
        {item.priority && (
          <Badge variant={PRIORITY_VARIANT[item.priority]} className="shrink-0">
            {PRIORITY_LABEL[item.priority] ?? item.priority}
          </Badge>
        )}
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="text-[11.5px] font-bold text-faint transition-colors hover:text-teal"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id, item.title)}
          className="text-[11.5px] font-bold text-faint transition-colors hover:text-mahogany"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function CollectionsClient({
  collections,
  selectedId,
  selected,
  items,
  autoOpen,
}: {
  collections: CollectionWithProgress[];
  selectedId: string | null;
  selected: Collection | null;
  items: CollectionItem[];
  autoOpen: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(autoOpen);
  const [editingCollection, setEditingCollection] = useState<Collection | undefined>(undefined);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | undefined>(undefined);

  function openNewCollection() {
    setEditingCollection(undefined);
    setCollectionDialogOpen(true);
  }

  function openEditCollection(collection: Collection) {
    setEditingCollection(collection);
    setCollectionDialogOpen(true);
  }

  async function handleDeleteCollection(id: string, name: string) {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      description: "This deletes the list and everything in it. This can't be undone.",
    });
    if (!ok) return;
    await removeCollection(id);
    toast.success("List deleted");
    if (id === selectedId) {
      const remaining = collections.filter((c) => c.id !== id);
      router.push(remaining.length > 0 ? `/collections/${remaining[0].id}` : "/collections");
    }
    router.refresh();
  }

  function openNewItem() {
    setEditingItem(undefined);
    setItemDialogOpen(true);
  }

  function openEditItem(item: CollectionItem) {
    setEditingItem(item);
    setItemDialogOpen(true);
  }

  async function handleToggleItem(item: CollectionItem) {
    if (!selected) return;
    await toggleItemDone(selected.id, item.id, !item.is_done);
    router.refresh();
  }

  async function handleDeleteItem(id: string, title: string) {
    if (!selected) return;
    const ok = await confirm({
      title: `Delete "${title}"?`,
      description: "This can't be undone.",
    });
    if (!ok) return;
    await removeCollectionItem(selected.id, id);
    toast.success("Item removed");
    router.refresh();
  }

  const doneCount = items.filter((i) => i.is_done).length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
  const subtitle = selected
    ? selected.description?.trim() || `${items.length} item${items.length === 1 ? "" : "s"} in this list`
    : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[38px] font-bold tracking-tight text-ink">Lists</h1>
          <p className="mt-2 text-[17px] text-muted">
            One place for the small stuff so it stops circling.
          </p>
        </div>
        <Button variant="accent" onClick={openNewCollection}>
          New list
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[290px_1fr]">
        <Card className="flex flex-col gap-1 p-3.5">
          {collections.length === 0 ? (
            <EmptyState
              title="No lists yet"
              description="Start one to keep the small stuff in one place."
              className="border-none bg-transparent p-4 py-8"
            />
          ) : (
            collections.map((c) => {
              const cardPct = c.itemCount > 0 ? Math.round((c.doneCount / c.itemCount) * 100) : 0;
              const active = c.id === selectedId;
              return (
                <div key={c.id} className="flex flex-col">
                  <Link
                    href={`/collections/${c.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-left transition-colors",
                      active ? "bg-teal-soft" : "hover:bg-surface-2",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15.5px] font-extrabold text-ink">
                        {c.name}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-muted">
                        {c.itemCount} item{c.itemCount === 1 ? "" : "s"}
                      </span>
                    </span>
                    <ProgressRing pct={cardPct} />
                  </Link>
                  <div className="flex gap-3 px-3.5 pb-2.5">
                    <button
                      type="button"
                      onClick={() => openEditCollection(c)}
                      className="text-[11.5px] font-bold text-faint transition-colors hover:text-teal"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCollection(c.id, c.name)}
                      className="text-[11.5px] font-bold text-faint transition-colors hover:text-mahogany"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <Card className="p-7 sm:p-8">
          {!selected ? (
            <EmptyState
              title={collections.length === 0 ? "No lists yet" : "Pick a list"}
              description={
                collections.length === 0
                  ? "Start a reading list, a gift-ideas board, or a bucket list of restaurants."
                  : "Choose one from the left to see what's inside."
              }
              action={
                collections.length === 0 ? (
                  <Button variant="accent" onClick={openNewCollection}>
                    Start a list
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-[26px] font-extrabold tracking-tight text-ink">
                    {selected.name}
                  </h2>
                  <p className="mt-1.5 text-[14.5px] text-muted">{subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[22px] font-extrabold text-ink">{pct}%</div>
                  <div className="text-[12.5px] font-bold text-muted">
                    {doneCount} / {items.length} done
                  </div>
                </div>
              </div>

              <Progress value={pct} className="mb-7 mt-6 bg-mahogany-soft" />

              {items.length === 0 ? (
                <EmptyState
                  title="No items yet"
                  description="Add the first thing you don't want to lose track of."
                />
              ) : (
                <div className="flex flex-col gap-0.5">
                  {items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onEdit={openEditItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={openNewItem}
                className="mt-5 w-full rounded-[14px] border-[1.5px] border-dashed border-line px-4 py-3.5 text-[14px] font-extrabold text-muted transition-colors hover:border-teal hover:text-teal"
              >
                Add an item
              </button>
            </>
          )}
        </Card>
      </div>

      <CollectionDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        collection={editingCollection}
      />
      {selected && (
        <CollectionItemDialog
          open={itemDialogOpen}
          onOpenChange={setItemDialogOpen}
          collectionId={selected.id}
          item={editingItem}
        />
      )}
    </div>
  );
}
