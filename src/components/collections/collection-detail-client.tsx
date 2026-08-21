"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Trash2, Pencil, ExternalLink } from "lucide-react";
import type { Tables } from "@/types/database.types";
import type { MarkProps } from "@/components/ui/mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mark } from "@/components/ui/mark";
import { EmptyState } from "@/components/ui/empty-state";
import { CollectionDialog } from "@/components/collections/collection-dialog";
import {
  removeCollection,
  saveCollectionItem,
  removeCollectionItem,
  toggleItemDone,
  reorderItems,
} from "@/server/actions/collections";

type Collection = Tables<"collections">;
type CollectionItem = Tables<"collection_items">;

export function CollectionDetailClient({
  collection,
  items,
}: {
  collection: Collection;
  items: CollectionItem[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    const result = await saveCollectionItem(collection.id, {
      title: newTitle.trim(),
      note: newNote.trim() || undefined,
      url: newUrl.trim() || undefined,
      isDone: false,
    });
    setAdding(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setNewTitle("");
    setNewUrl("");
    setNewNote("");
    router.refresh();
  }

  async function handleToggle(item: CollectionItem) {
    await toggleItemDone(collection.id, item.id, !item.is_done);
    router.refresh();
  }

  async function handleDeleteItem(id: string) {
    await removeCollectionItem(collection.id, id);
    toast.success("Item removed");
    router.refresh();
  }

  async function handleDeleteCollection() {
    await removeCollection(collection.id);
    toast.success("Collection deleted");
    router.push("/collections");
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    await reorderItems(
      collection.id,
      reordered.map((i) => i.id),
    );
    router.refresh();
  }

  const doneCount = items.filter((i) => i.is_done).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Mark
            shape={collection.icon_mark as MarkProps["shape"]}
            tone="teal"
            size={14}
            className="mt-2"
          />
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-ink">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 max-w-xl text-[13.5px] text-muted">{collection.description}</p>
            )}
            <p className="mt-1 text-[12.5px] text-faint">
              {doneCount} / {items.length} done
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteCollection}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Add an item…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:flex-1"
            />
            <Input
              placeholder="URL (optional)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="sm:w-48"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Note (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="accent" disabled={adding || !newTitle.trim()}>
              Add
            </Button>
          </div>
        </form>
      </Card>

      {items.length === 0 ? (
        <EmptyState title="No items yet" description="Add the first thing to this collection above." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <Card key={item.id} className="flex items-start gap-3 p-4">
              <Checkbox
                checked={item.is_done}
                onChange={() => handleToggle(item)}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div
                  className={
                    item.is_done
                      ? "text-[14px] font-semibold text-faint line-through"
                      : "text-[14px] font-semibold text-ink"
                  }
                >
                  {item.title}
                </div>
                {item.note && <p className="mt-0.5 text-[12.5px] text-muted">{item.note}</p>}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-teal hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> {item.url}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteItem(item.id)}
                aria-label="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <CollectionDialog open={editOpen} onOpenChange={setEditOpen} collection={collection} />
    </div>
  );
}
